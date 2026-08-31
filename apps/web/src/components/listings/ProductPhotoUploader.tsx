import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2, RotateCcw, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { deleteUploadedImage, uploadImage, UploadedImage } from "@/services/listingApi";

const MAX_IMAGES = 8;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface ProductPhoto {
  id: string;
  url: string;
  publicId: string;
  displayOrder: number;
}

interface PhotoItem extends ProductPhoto {
  file?: File;
  preview: string;
  status: "uploading" | "uploaded" | "error";
  progress: number;
  error?: string;
}

interface Props {
  value: ProductPhoto[];
  onChange: (photos: ProductPhoto[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onReadyChange?: (ready: boolean) => void;
}

function ordered(items: PhotoItem[]) {
  return items.map((item, displayOrder) => ({ id: item.id, url: item.url, publicId: item.publicId, displayOrder }));
}

export function ProductPhotoUploader({ value, onChange, onUploadingChange, onReadyChange }: Props) {
  const [items, setItems] = useState<PhotoItem[]>(() => value.map((photo) => ({ ...photo, preview: photo.url, status: "uploaded", progress: 100 })));
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const uploading = items.some((item) => item.status === "uploading");
    onUploadingChange?.(uploading);
    onReadyChange?.(items.length > 0 && items.every((item) => item.status === "uploaded"));
  }, [items, onUploadingChange, onReadyChange]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => { if (item.file) URL.revokeObjectURL(item.preview); });
  }, []);

  const update = (next: PhotoItem[]) => {
    setItems(next);
    onChange(ordered(next.filter((item) => item.status === "uploaded")));
  };

  const addFiles = (files: FileList | File[]) => {
    setMessage(null);
    const candidates = Array.from(files);
    if (items.length + candidates.length > MAX_IMAGES) { setMessage(`You can upload up to ${MAX_IMAGES} photos.`); return; }
    const accepted: PhotoItem[] = [];
    for (const file of candidates) {
      if (!ACCEPTED.has(file.type)) { setMessage("Please upload a JPG, PNG, or WEBP image."); continue; }
      if (file.size > MAX_BYTES) { setMessage("Image must be smaller than 10 MB."); continue; }
      accepted.push({ id: `local-${Date.now()}-${Math.random()}`, url: "", publicId: "", displayOrder: items.length + accepted.length, file, preview: URL.createObjectURL(file), status: "uploading", progress: 0 });
    }
    if (!accepted.length) return;
    const next = [...items, ...accepted];
    update(next);
    accepted.forEach((item) => void upload(item.id, item.file!));
  };

  const upload = async (localId: string, file: File) => {
    try {
      const result: UploadedImage = await uploadImage(file, (progress) => setItems((current) => current.map((item) => item.id === localId ? { ...item, progress } : item)));
      setItems((current) => {
        const next = current.map((item) => item.id === localId ? { ...item, id: result.id, url: result.secureUrl, publicId: result.publicId, status: "uploaded" as const, progress: 100 } : item);
        onChange(ordered(next.filter((item) => item.status === "uploaded")));
        return next;
      });
    } catch (error: any) {
      setItems((current) => current.map((item) => item.id === localId ? { ...item, status: "error", error: error.message || "Couldn't upload this image." } : item));
    }
  };

  const remove = async (item: PhotoItem) => {
    if (item.status === "uploaded" && item.id) {
      try { await deleteUploadedImage(item.id); } catch {}
    }
    if (item.file) URL.revokeObjectURL(item.preview);
    update(items.filter((current) => current.id !== item.id));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  const uploading = items.some((item) => item.status === "uploading");
  const uploadedCount = items.filter((item) => item.status === "uploaded").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ImagePlus className="w-5 h-5 text-primary" /> Product Photos</CardTitle>
        <CardDescription>Upload clear photos of your item. The first photo will be your primary image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="button" tabIndex={0} onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
          onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}
          className="rounded-2xl border-2 border-dashed border-primary/25 bg-primary/[0.03] p-7 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ""; }} />
          <UploadCloud className="mx-auto w-9 h-9 text-primary/70" />
          <p className="mt-2 font-semibold">+ Add Photos</p>
          <p className="text-sm text-muted-foreground mt-1">Click to select or drag and drop · JPG, PNG, WEBP · Up to 10 MB each</p>
          <p className="text-xs text-muted-foreground mt-1">{items.length}/{MAX_IMAGES} photos</p>
        </div>
        {message && <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{message}</p>}
        {items.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map((item, index) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
                  <img src={item.url || item.preview} alt={`Product photo ${index + 1}`} className={`w-full h-full object-cover ${item.status === "uploading" ? "opacity-60" : ""}`} />
                  {item.status === "uploading" && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white"><Loader2 className="w-7 h-7 animate-spin" /><span className="text-xs mt-1">Uploading {item.progress}%</span></div>}
                  {item.status === "error" && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-2 text-center"><p className="text-xs">Couldn't upload this image.</p><Button size="sm" variant="secondary" className="mt-2 h-7 text-xs" onClick={() => { setItems((current) => current.map((photo) => photo.id === item.id ? { ...photo, status: "uploading", error: undefined, progress: 0 } : photo)); void upload(item.id, item.file!); }}><RotateCcw className="w-3 h-3" /> Retry</Button></div>}
                  <div className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-800 shadow">{index === 0 ? <><Star className="inline w-3 h-3 fill-amber-400 text-amber-500 mr-1" />Primary</> : `Photo ${index + 1}`}</div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1"><Button type="button" size="sm" variant="secondary" className="h-7 w-7 p-0" disabled={index === 0} aria-label="Move photo left" onClick={() => move(index, -1)}><ChevronLeft className="w-3.5 h-3.5" /></Button><Button type="button" size="sm" variant="secondary" className="h-7 w-7 p-0" disabled={index === items.length - 1} aria-label="Move photo right" onClick={() => move(index, 1)}><ChevronRight className="w-3.5 h-3.5" /></Button></div>
                    <Button type="button" size="sm" variant="destructive" className="h-7 w-7 p-0" aria-label="Remove photo" onClick={() => void remove(item)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{uploadedCount} of {items.length} photos uploaded</span>{uploading && <span className="inline-flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</span>}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
