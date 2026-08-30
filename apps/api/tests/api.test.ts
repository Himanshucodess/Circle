import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import prisma from "../src/lib/prisma";

const app = createApp();

// Use timestamp to make slugs/keys unique and avoid collisions with seeded data.
const ts = Date.now();
const catSlug = `test-cat-${ts}`;
const fieldKeyA = `test_field_a_${ts}`;
const fieldKeyB = `test_field_b_${ts}`;

let catId: string;
let fieldIdA: string;
let fieldIdB: string;
let publishedId: string;

describe("Marketplace Dynamic Listing API", () => {
  beforeAll(async () => {
    // Ensure DB is reachable
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test data (best effort, leave if fails)
    try {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (cat) {
        await prisma.listing.deleteMany({ where: { categoryId: cat.id } });
        await prisma.schemaVersion.deleteMany({ where: { categoryId: cat.id } });
        await prisma.categoryField.deleteMany({ where: { categoryId: cat.id } });
        await prisma.category.delete({ where: { id: cat.id } });
      }
      await prisma.fieldDefinition.deleteMany({ where: { key: { in: [fieldKeyA, fieldKeyB] } } });
      // also catch conditional test fields if created
      await prisma.fieldDefinition.deleteMany({ where: { key: { startsWith: `cond_${ts}` } } });
      const condCat = await prisma.category.findUnique({ where: { slug: `cond-cat-${ts}` } });
      if (condCat) {
        await prisma.listing.deleteMany({ where: { categoryId: condCat.id } });
        await prisma.schemaVersion.deleteMany({ where: { categoryId: condCat.id } });
        await prisma.categoryField.deleteMany({ where: { categoryId: condCat.id } });
        await prisma.category.delete({ where: { id: condCat.id } });
      }
      // bicycle test data is kept (used for demo), but clean bicycle listings created by this test run?
      // Keep bicycle category for manual demo; only clean test-cat
    } catch {}
    await prisma.$disconnect();
  });

  it("creates a category", async () => {
    const res = await request(app)
      .post("/api/admin/categories")
      .send({ name: "Test Cat", slug: catSlug, icon: "🧪" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(catSlug);
    catId = res.body.data.id;
  });

  it("creates a field", async () => {
    const res = await request(app).post("/api/admin/fields").send({
      key: fieldKeyA,
      label: "Test Field A",
      type: "TEXT",
      config: { minLength: 2, maxLength: 20 },
    });
    expect(res.status).toBe(201);
    fieldIdA = res.body.data.id;

    const res2 = await request(app).post("/api/admin/fields").send({
      key: fieldKeyB,
      label: "Test Field B",
      type: "NUMBER",
      config: { min: 0, max: 100 },
    });
    expect(res2.status).toBe(201);
    fieldIdB = res2.body.data.id;
  });

  it("attaches field to category", async () => {
    const res = await request(app)
      .post(`/api/admin/categories/${catId}/fields`)
      .send({ fieldId: fieldIdA, isRequired: true });
    expect(res.status).toBe(201);
    const res2 = await request(app)
      .post(`/api/admin/categories/${catId}/fields`)
      .send({ fieldId: fieldIdB });
    expect(res2.status).toBe(201);
  });

  it("publishes schema", async () => {
    const res = await request(app).post(`/api/admin/categories/${catId}/schema/publish`);
    expect(res.status).toBe(201);
    publishedId = res.body.data.id;
  });

  it("gets published schema (seller)", async () => {
    const res = await request(app).get(`/api/categories/${catSlug}/schema`);
    expect(res.status).toBe(200);
    expect(res.body.data.fields.length).toBe(2);
    expect(res.body.data.fields[0].key).toBe(fieldKeyA);
  });

  it("creates valid listing", async () => {
    const res = await request(app).post("/api/listings").send({
      categoryId: catId,
      title: "Test Listing Valid",
      description: "A valid listing with enough description length",
      price: 999,
      condition: "USED",
      location: "TestCity",
      attributes: { [fieldKeyA]: "hello", [fieldKeyB]: 42 },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.attributes[fieldKeyA]).toBe("hello");
  });

  it("rejects invalid listing (common validation)", async () => {
    const res = await request(app).post("/api/listings").send({
      categoryId: catId,
      title: "bad",
      description: "short",
      price: -5,
      condition: "USED",
      location: "X",
      attributes: {},
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid dynamic attributes (max)", async () => {
    const res = await request(app).post("/api/listings").send({
      categoryId: catId,
      title: "Valid title here",
      description: "Description long enough to pass common validation",
      price: 100,
      condition: "USED",
      location: "TestCity",
      attributes: { [fieldKeyA]: "ok", [fieldKeyB]: 999 },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.fields[fieldKeyB]).toMatch(/at most 100/);
  });

  it("validates conditional fields", async () => {
    // Create a conditional category
    const catRes = await request(app)
      .post("/api/admin/categories")
      .send({ name: "Cond Cat", slug: `cond-cat-${ts}`, icon: "🔀" });
    const condCatId = catRes.body.data.id;

    const f1 = await request(app).post("/api/admin/fields").send({
      key: `cond_under_${ts}`,
      label: "Under Warranty",
      type: "RADIO",
      config: { options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }] },
    });
    const f2 = await request(app).post("/api/admin/fields").send({
      key: `cond_expiry_${ts}`,
      label: "Warranty Expiry",
      type: "DATE",
      config: {},
    });
    const fid1 = f1.body.data.id;
    const fid2 = f2.body.data.id;

    await request(app).post(`/api/admin/categories/${condCatId}/fields`).send({ fieldId: fid1 });
    await request(app).post(`/api/admin/categories/${condCatId}/fields`).send({ fieldId: fid2, isRequired: true });
    // Make expiry conditional on underWarranty == true
    await request(app)
      .patch(`/api/admin/categories/${condCatId}/fields/${fid2}`)
      .send({ conditionalRule: { field: `cond_under_${ts}`, operator: "equals", value: "true" } });

    await request(app).post(`/api/admin/categories/${condCatId}/schema/publish`);

    // Hidden -> should pass without expiry
    const okHidden = await request(app).post("/api/listings").send({
      categoryId: condCatId,
      title: "Cond hidden ok",
      description: "Description long enough for conditional hidden test",
      price: 100,
      condition: "USED",
      location: "TestCity",
      attributes: { [`cond_under_${ts}`]: "false" },
    });
    expect(okHidden.status).toBe(201);

    // Visible but missing required -> should fail
    const failVisible = await request(app).post("/api/listings").send({
      categoryId: condCatId,
      title: "Cond visible fail",
      description: "Description long enough for conditional visible fail",
      price: 100,
      condition: "USED",
      location: "TestCity",
      attributes: { [`cond_under_${ts}`]: "true" },
    });
    expect(failVisible.status).toBe(400);

    // Visible and provided -> pass
    const okVisible = await request(app).post("/api/listings").send({
      categoryId: condCatId,
      title: "Cond visible ok",
      description: "Description long enough for conditional visible ok",
      price: 100,
      condition: "USED",
      location: "TestCity",
      attributes: { [`cond_under_${ts}`]: "true", [`cond_expiry_${ts}`]: "2026-12-31" },
    });
    expect(okVisible.status).toBe(201);
  });

  it("listing uses correct schema version and old listings remain after republish", async () => {
    const firstListing = await request(app).post("/api/listings").send({
      categoryId: catId,
      title: "Version test 1",
      description: "Description long enough for version test one",
      price: 10,
      condition: "USED",
      location: "TestCity",
      attributes: { [fieldKeyA]: "v1", [fieldKeyB]: 1 },
    });
    const firstId = firstListing.body.data.id;
    const detailV1 = await request(app).get(`/api/listings/${firstId}`);
    const ver1 = detailV1.body.data.schemaVersion;

    // Add another field and republish to bump version
    const f3 = await request(app).post("/api/admin/fields").send({
      key: `extra_${ts}`,
      label: "Extra",
      type: "TEXT",
      config: {},
    });
    await request(app).post(`/api/admin/categories/${catId}/fields`).send({ fieldId: f3.body.data.id });
    await request(app).post(`/api/admin/categories/${catId}/schema/publish`);

    const after = await request(app).get(`/api/categories/${catSlug}/schema`);
    expect(after.body.data.version).toBeGreaterThan(ver1);

    const detailStillV1 = await request(app).get(`/api/listings/${firstId}`);
    expect(detailStillV1.body.data.schemaVersion).toBe(ver1);
  });

  it("bicycle extensibility — seller gets new category without frontend change", async () => {
    // Bicycle was created earlier via manual API; verify seller flow dynamically gets it
    const cats = await request(app).get("/api/categories");
    const bike = cats.body.data.find((c: any) => c.slug === "bicycle");
    expect(bike).toBeDefined();
    const schema = await request(app).get(`/api/categories/bicycle/schema`);
    expect(schema.status).toBe(200);
    const keys = schema.body.data.fields.map((f: any) => f.key);
    expect(keys).toEqual(expect.arrayContaining(["brand", "frame_size", "wheel_size", "gear_count", "frame_material"]));
  });
});
