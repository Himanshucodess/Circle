import { PrismaClient } from "@prisma/client";
import { FIELD_TYPES } from "../packages/shared/src/constants";

const prisma = new PrismaClient();

interface FieldSeed {
  key: string;
  label: string;
  type: string;
  description?: string;
  config: any;
}

interface CategorySeed {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields: { key: string; required?: boolean }[];
}

async function upsertField(f: FieldSeed) {
  return prisma.fieldDefinition.upsert({
    where: { key: f.key },
    update: {
      label: f.label,
      type: f.type as any,
      description: f.description,
      config: f.config,
    },
    create: {
      key: f.key,
      label: f.label,
      type: f.type as any,
      description: f.description,
      config: f.config,
    },
  });
}

async function main() {
  console.log("Seeding fields...");

  const fields: Record<string, FieldSeed> = {
    brand: {
      key: "brand",
      label: "Brand",
      type: FIELD_TYPES.TEXT,
      description: "The manufacturer or brand name.",
      config: { required: true, placeholder: "e.g. Apple", minLength: 2, maxLength: 50 },
    },
    model: {
      key: "model",
      label: "Model",
      type: FIELD_TYPES.TEXT,
      description: "The exact model name.",
      config: { required: true, placeholder: "e.g. iPhone 15", minLength: 2, maxLength: 80 },
    },
    storage: {
      key: "storage",
      label: "Storage",
      type: FIELD_TYPES.SELECT,
      description: "Onboard storage capacity.",
      config: {
        required: true,
        placeholder: "Select storage",
        options: [
          { label: "64GB", value: "64gb" },
          { label: "128GB", value: "128gb" },
          { label: "256GB", value: "256gb" },
          { label: "512GB", value: "512gb" },
          { label: "1TB", value: "1tb" },
        ],
      },
    },
    ram: {
      key: "ram",
      label: "RAM",
      type: FIELD_TYPES.SELECT,
      description: "Memory capacity.",
      config: {
        required: true,
        options: [
          { label: "4GB", value: "4gb" },
          { label: "6GB", value: "6gb" },
          { label: "8GB", value: "8gb" },
          { label: "12GB", value: "12gb" },
          { label: "16GB", value: "16gb" },
          { label: "32GB", value: "32gb" },
        ],
      },
    },
    originalBox: {
      key: "originalBox",
      label: "Original Box",
      type: FIELD_TYPES.RADIO,
      description: "Does it come with the original box?",
      config: {
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
    },
    batteryHealth: {
      key: "batteryHealth",
      label: "Battery Health",
      type: FIELD_TYPES.NUMBER,
      description: "Battery health as a percentage (0-100).",
      config: { required: true, min: 0, max: 100, unit: "%", placeholder: "e.g. 92" },
    },
    processor: {
      key: "processor",
      label: "Processor",
      type: FIELD_TYPES.TEXT,
      description: "CPU model.",
      config: { required: true, placeholder: "e.g. Apple M2", minLength: 2, maxLength: 60 },
    },
    graphicsCard: {
      key: "graphicsCard",
      label: "Graphics Card",
      type: FIELD_TYPES.TEXT,
      description: "GPU model.",
      config: { placeholder: "e.g. NVIDIA RTX 4060", maxLength: 60 },
    },
    material: {
      key: "material",
      label: "Material",
      type: FIELD_TYPES.RADIO,
      description: "Primary material.",
      config: {
        required: true,
        options: [
          { label: "Leather", value: "leather" },
          { label: "Fabric", value: "fabric" },
          { label: "Velvet", value: "velvet" },
          { label: "Synthetic Leather", value: "synthetic-leather" },
          { label: "Wood", value: "wood" },
        ],
      },
    },
    seatingCapacity: {
      key: "seatingCapacity",
      label: "Seating Capacity",
      type: FIELD_TYPES.NUMBER,
      description: "How many people can it seat?",
      config: { required: true, min: 1, max: 10, unit: " seats" },
    },
    petFriendly: {
      key: "petFriendly",
      label: "Pet Friendly",
      type: FIELD_TYPES.RADIO,
      description: "Suitable for households with pets?",
      config: {
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
    },
    dimensions: {
      key: "dimensions",
      label: "Dimensions",
      type: FIELD_TYPES.TEXT,
      description: "Width x Depth x Height.",
      config: { placeholder: "e.g. 200 x 90 x 85 cm", maxLength: 60 },
    },
    color: {
      key: "color",
      label: "Color",
      type: FIELD_TYPES.SELECT,
      config: {
        options: [
          { label: "Black", value: "black" },
          { label: "White", value: "white" },
          { label: "Silver", value: "silver" },
          { label: "Gold", value: "gold" },
          { label: "Blue", value: "blue" },
          { label: "Green", value: "green" },
          { label: "Red", value: "red" },
        ],
      },
    },
    operatingSystem: {
      key: "operatingSystem",
      label: "Operating System",
      type: FIELD_TYPES.SELECT,
      config: {
        options: [
          { label: "iOS", value: "ios" },
          { label: "Android", value: "android" },
          { label: "macOS", value: "macos" },
          { label: "Windows", value: "windows" },
          { label: "Linux", value: "linux" },
        ],
      },
    },
  };

  const fieldMap: Record<string, string> = {};
  for (const f of Object.values(fields)) {
    const created = await upsertField(f);
    fieldMap[f.key] = created.id;
  }

  console.log(`Seeded ${Object.keys(fields).length} fields.`);

  const categories: CategorySeed[] = [
    {
      name: "Mobile Phone",
      slug: "mobile-phone",
      description: "Secondhand smartphones and mobile phones.",
      icon: "📱",
      fields: [
        { key: "brand", required: true },
        { key: "model", required: true },
        { key: "storage", required: true },
        { key: "ram", required: true },
        { key: "operatingSystem" },
        { key: "color" },
        { key: "originalBox" },
        { key: "batteryHealth", required: true },
      ],
    },
    {
      name: "Laptop",
      slug: "laptop",
      description: "Secondhand laptops and notebooks.",
      icon: "💻",
      fields: [
        { key: "brand", required: true },
        { key: "model", required: true },
        { key: "processor", required: true },
        { key: "ram", required: true },
        { key: "storage", required: true },
        { key: "graphicsCard" },
        { key: "batteryHealth", required: true },
      ],
    },
    {
      name: "Sofa",
      slug: "sofa",
      description: "Secondhand sofas and couches.",
      icon: "🛋️",
      fields: [
        { key: "material", required: true },
        { key: "seatingCapacity", required: true },
        { key: "petFriendly" },
        { key: "dimensions" },
        { key: "color" },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        status: "ACTIVE",
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        status: "ACTIVE",
      },
    });

    // Attach fields in order
    const existingCategoryFields = await prisma.categoryField.findMany({
      where: { categoryId: category.id },
    });
    const existingKeys = new Map(
      existingCategoryFields.map((cf) => {
        const id: string = cf.fieldId;
        return [id, cf.displayOrder];
      })
    );

    for (let i = 0; i < cat.fields.length; i++) {
      const spec = cat.fields[i];
      const fieldId = fieldMap[spec.key];
      await prisma.categoryField.upsert({
        where: { categoryId_fieldId: { categoryId: category.id, fieldId } },
        update: { displayOrder: i, isRequired: spec.required ?? false },
        create: {
          categoryId: category.id,
          fieldId,
          displayOrder: i,
          isRequired: spec.required ?? false,
        },
      });
    }

    // Build & publish schema version
    const categoryFields = await prisma.categoryField.findMany({
      where: { categoryId: category.id },
      include: { field: true },
      orderBy: { displayOrder: "asc" },
    });

    const schemaFields = categoryFields.map((cf) => {
      const cfg: any = cf.field.config ?? {};
      const v: any = {};
      if (cfg.min !== undefined) v.min = cfg.min;
      if (cfg.max !== undefined) v.max = cfg.max;
      if (cfg.minLength !== undefined) v.minLength = cfg.minLength;
      if (cfg.maxLength !== undefined) v.maxLength = cfg.maxLength;
      if (cfg.step !== undefined) v.step = cfg.step;

      return {
        id: cf.field.id,
        key: cf.field.key,
        label: cf.field.label,
        type: cf.field.type,
        required: cf.isRequired,
        placeholder: cfg.placeholder,
        defaultValue: cfg.defaultValue,
        unit: cfg.unit,
        helpText: cfg.helpText ?? cf.field.description,
        description: cf.field.description,
        options:
          cf.field.type === "SELECT" ||
          cf.field.type === "RADIO" ||
          cf.field.type === "MULTI_SELECT"
            ? (cfg.options ?? [])
            : undefined,
        validation: v,
        conditionalRule: cf.conditionalRule,
      };
    });

    const schemaJson = { fields: schemaFields };
    const existingPublished = await prisma.schemaVersion.findFirst({
      where: { categoryId: category.id, status: "PUBLISHED" },
    });

    if (existingPublished) {
      // Update existing (idempotent seed) - but keep published
      await prisma.schemaVersion.update({
        where: { id: existingPublished.id },
        data: { schemaJson },
      });
    } else {
      await prisma.schemaVersion.create({
        data: {
          categoryId: category.id,
          version: 1,
          status: "PUBLISHED",
          publishedAt: new Date(),
          schemaJson,
        },
      });
    }
  }

  console.log("Seeded categories.");

  // Seed sample listings only if none exist
  const listingCount = await prisma.listing.count();
  if (listingCount === 0) {
    await seedListings(fieldMap);
  } else {
    console.log("Listings already exist, skipping sample listings.");
  }

  console.log("Seed complete.");
}

async function getPublished(catFieldMap: any, slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new Error(`Category ${slug} not found`);
  const schema = await prisma.schemaVersion.findFirst({
    where: { categoryId: category.id, status: "PUBLISHED" },
  });
  if (!schema) throw new Error(`No published schema for ${slug}`);
  return { category, schema };
}

async function seedListings(fieldMap: Record<string, string>) {
  const images = {
    iphone: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
    ],
    macbook: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    ],
    galaxy: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
    ],
    dell: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
    ],
    sofa1: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
      "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600&q=80",
    ],
    sofa2: [
      "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=600&q=80",
    ],
  };

  const mobile = await getPublished(fieldMap, "mobile-phone");
  const laptop = await getPublished(fieldMap, "laptop");
  const sofa = await getPublished(fieldMap, "sofa");

  const listings = [
    {
      categoryId: mobile.category.id,
      schemaVersionId: mobile.schema.id,
      title: "iPhone 15 256GB - Black",
      description:
        "Selling my iPhone 15 in excellent condition. Battery health at 94%. Comes with original box and charging cable. No scratches, always used with a case and screen protector.",
      price: 55000,
      condition: "USED",
      location: "Mumbai",
      attributes: {
        brand: "Apple",
        model: "iPhone 15",
        storage: "256gb",
        ram: "8gb",
        operatingSystem: "ios",
        color: "black",
        originalBox: "true",
        batteryHealth: 94,
      },
      images: images.iphone,
    },
    {
      categoryId: mobile.category.id,
      schemaVersionId: mobile.schema.id,
      title: "Samsung Galaxy S23 Ultra",
      description:
        "Flagship Samsung Galaxy S23 Ultra with S-Pen. 512GB storage, 12GB RAM. Battery health at 88%. Loved it but upgrading.",
      price: 62000,
      condition: "USED",
      location: "Delhi",
      attributes: {
        brand: "Samsung",
        model: "Galaxy S23 Ultra",
        storage: "512gb",
        ram: "12gb",
        operatingSystem: "android",
        color: "green",
        originalBox: "true",
        batteryHealth: 88,
      },
      images: images.galaxy,
    },
    {
      categoryId: mobile.category.id,
      schemaVersionId: mobile.schema.id,
      title: "Google Pixel 8 Pro",
      description:
        "Google Pixel 8 Pro in Bay color. 256GB storage. Excellent camera phone, barely used for 3 months.",
      price: 48000,
      condition: "LIKE_NEW",
      location: "Bengaluru",
      attributes: {
        brand: "Google",
        model: "Pixel 8 Pro",
        storage: "256gb",
        ram: "12gb",
        operatingSystem: "android",
        color: "blue",
        originalBox: "false",
        batteryHealth: 97,
      },
      images: images.iphone,
    },
    {
      categoryId: laptop.category.id,
      schemaVersionId: laptop.schema.id,
      title: "MacBook Air M2 (2022)",
      description:
        "MacBook Air M2 with 8GB RAM and 256GB SSD. Battery health at 100%. Lightly used, near new condition. Includes box and charger.",
      price: 78000,
      condition: "LIKE_NEW",
      location: "Hyderabad",
      attributes: {
        brand: "Apple",
        model: "MacBook Air M2",
        processor: "Apple M2",
        ram: "8gb",
        storage: "256gb",
        batteryHealth: 100,
      },
      images: images.macbook,
    },
    {
      categoryId: laptop.category.id,
      schemaVersionId: laptop.schema.id,
      title: "Dell XPS 13 Plus",
      description:
        "Powerful Dell XPS 13 Plus with Intel i7, 16GB RAM, 512GB SSD, and Intel Iris graphics. Great for work and multitasking.",
      price: 95000,
      condition: "USED",
      location: "Pune",
      attributes: {
        brand: "Dell",
        model: "XPS 13 Plus",
        processor: "Intel Core i7-1260P",
        ram: "16gb",
        storage: "512gb",
        graphicsCard: "Intel Iris Xe",
        batteryHealth: 91,
      },
      images: images.dell,
    },
    {
      categoryId: sofa.category.id,
      schemaVersionId: sofa.schema.id,
      title: "IKEA 3-Seater Fabric Sofa",
      description:
        "Comfortable IKEA 3-seater sofa in grey fabric. In great condition, no stains or tears. Pet friendly and durable.",
      price: 18000,
      condition: "USED",
      location: "Mumbai",
      attributes: {
        material: "fabric",
        seatingCapacity: 3,
        petFriendly: "true",
        dimensions: "200 x 90 x 85 cm",
        color: "grey",
      },
      images: images.sofa1,
    },
    {
      categoryId: sofa.category.id,
      schemaVersionId: sofa.schema.id,
      title: "3-Seater Leather Sofa",
      description:
        "Premium genuine leather 3-seater sofa. Brown color, very sturdy wooden frame. Minor wear on one armrest, otherwise excellent.",
      price: 42000,
      condition: "USED",
      location: "Delhi",
      attributes: {
        material: "leather",
        seatingCapacity: 3,
        petFriendly: "false",
        dimensions: "210 x 95 x 88 cm",
        color: "brown",
      },
      images: images.sofa2,
    },
  ];

  for (const l of listings) {
    await prisma.listing.create({
      data: {
        categoryId: l.categoryId,
        schemaVersionId: l.schemaVersionId,
        title: l.title,
        description: l.description,
        price: l.price,
        condition: l.condition,
        location: l.location,
        attributes: l.attributes,
        images: {
          create: l.images.map((url, i) => ({ url, displayOrder: i })),
        },
      },
    });
  }

  console.log(`Seeded ${listings.length} sample listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
