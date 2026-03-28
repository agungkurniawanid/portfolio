const fs = require('fs');
const path = './src/components/gallery/GuestRegistrationModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Types & Imports
code = code.replace(
  /import { GALLERY_CATEGORIES } from "@\/data\/galleryData"\r?\nimport { GalleryGuest } from "@\/types\/gallery"/,
  `import { GALLERY_CATEGORIES } from "@/data/galleryData"\nimport { GalleryGuest, GalleryAlbum } from "@/types/gallery"\nimport { fetchGalleryAlbums } from "@/lib/galleryApi"`
);
code = code.replace(
  /type Step = "checking" \| "profile" \| "album" \| "photos" \| "success"/,
  `type Step = "checking" | "profile" | "photos" | "success"`
);

// 2. State definitions
code = code.replace(
  /const \[guest, setGuest\] = useState<GalleryGuest \| null>\(null\)/,
  `const [guest, setGuest] = useState<GalleryGuest | null>(null)\n  const [guestAlbums, setGuestAlbums] = useState<GalleryAlbum[]>([])\n  const [selectedAlbumSlug, setSelectedAlbumSlug] = useState<string>("new")`
);

// 3. Add useEffect for albums
code = code.replace(
  /const \[isVisible, setIsVisible\] = useState\(false\)/,
  `const [isVisible, setIsVisible] = useState(false)\n\n  useEffect(() => {\n    if (guest && isOpen) {\n      fetchGalleryAlbums().then((all) => {\n        const theirAlbums = all.filter((a) => a.guestId === guest.id)\n        setGuestAlbums(theirAlbums)\n        if (theirAlbums.length > 0) {\n          setSelectedAlbumSlug(theirAlbums[0].slug)\n        } else {\n          setSelectedAlbumSlug("new")\n        }\n      })\n    }\n  }, [guest, isOpen])`
);

// 4. step changes album -> photos in initCheck
code = code.replace(/setStep\("album"\)/g, 'setStep("photos")');

// 5. handlePhotosSubmit rewrite (from validateAlbum to end of handlePhotosSubmit)
const handleAlbumAndPhotosRegex = /const validateAlbum = \(\) => \{[\s\S]*?  \}, \[photos, guest, createdAlbum, onSuccess\]\)/;
const newHandlers = `const validateAlbum = () => {
    const errs: typeof albumErrors = {}
    if (!albumForm.name.trim()) errs.name = "Nama album wajib diisi"
    if (!albumForm.category) errs.category = "Pilih kategori terlebih dahulu"
    setAlbumErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePhotosSubmit = useCallback(async () => {
    if (!photos.length) {
      setPhotoError("Tambahkan setidaknya 1 foto")
      return
    }
    const emptyTitles = photos.filter((p) => !p.title.trim())
    if (emptyTitles.length > 0) {
      setShowTitleErrors(true)
      setPhotoError(\`\${emptyTitles.length} foto belum memiliki judul. Judul wajib diisi.\`)
      return
    }
    setShowTitleErrors(false)
    if (!guest) return

    if (selectedAlbumSlug === "new") {
      if (!validateAlbum()) return
    }

    setIsSubmitting(true)
    setSubmitError("")

    let targetAlbum = null;

    try {
      if (selectedAlbumSlug === "new") {
        const res = await fetch("/api/gallery/guest/album", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestId: guest.id,
            guestName: guest.name,
            name: albumForm.name.trim(),
            category: albumForm.category,
            description: albumForm.description.trim(),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Gagal membuat album")
        targetAlbum = { slug: data.album.slug, name: data.album.name, category: data.album.category }
        setCreatedAlbum(targetAlbum)
      } else {
        const existing = guestAlbums.find(a => a.slug === selectedAlbumSlug)
        if (!existing) throw new Error("Album tidak valid")
        targetAlbum = { slug: existing.slug, name: existing.name, category: existing.category }
        setCreatedAlbum(targetAlbum)
      }

      const uploaded: { imageUrl: string; thumbnailUrl: string; title: string; description: string; location: string; date: string; width: number; height: number }[] = []

      for (const photo of photos) {
        const ext = photo.file.name.split(".").pop()
        const path = \`photos/\${guest.id}/\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}.\${ext}\`

        const { error: uploadErr } = await supabase.storage
          .from("gallery-photos")
          .upload(path, photo.file, {
            contentType: photo.file.type,
            upsert: false,
          })

        if (uploadErr) {
          console.error("Upload error:", uploadErr.message)
          continue
        }

        const { data } = supabase.storage.from("gallery-photos").getPublicUrl(path)
        uploaded.push({
          imageUrl: data.publicUrl,
          thumbnailUrl: data.publicUrl,
          title: photo.title,
          description: photo.description,
          location: photo.location,
          date: photo.date,
          width: photo.width,
          height: photo.height,
        })
      }

      if (!uploaded.length) throw new Error("Tidak ada foto yang berhasil diupload")

      const resPhoto = await fetch("/api/gallery/guest/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          guestName: guest.name,
          albumSlug: targetAlbum.slug,
          albumName: targetAlbum.name,
          albumCategory: targetAlbum.category,
          photos: uploaded,
        }),
      })
      const dataPhoto = await resPhoto.json()
      if (!resPhoto.ok) throw new Error(dataPhoto.error || "Gagal menyimpan foto")

      const updatedGuest: GalleryGuest = {
        ...guest,
        albumCount: (guest.albumCount || 0) + (selectedAlbumSlug === "new" ? 1 : 0),
        photoCount: (guest.photoCount || 0) + uploaded.length,
      }
      setGuest(updatedGuest)
      saveLocalGuest(updatedGuest)
      // Call onSuccess to pass data back upwards!
      onSuccess?.(updatedGuest)

      setStep("success")
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }, [photos, guest, albumForm, selectedAlbumSlug, guestAlbums, onSuccess])`;

code = code.replace(handleAlbumAndPhotosRegex, newHandlers);

// 6. Replacing JSX step === "album" and step === "photos"
const jsxRegex = /\{\/\* ── STEP 2: Album ── \*\/\}[\s\S]*?\{\/\* ── STEP 4: Success ── \*\/\}/;
const newJSX = `{/* ── STEP 3: Photos ── */}
          {step === "photos" && (
            <>
              <StepDots currentStep={guest?.albumCount ? 1 : 2} totalSteps={totalSteps === 3 ? 2 : 1} />

              {/* Welcome back banner if already registered */}
              {guest && (
                <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-accentColor/5 border border-accentColor/20">
                  {guest.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image src={guest.avatarUrl} alt={guest.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <InitialsAvatar name={guest.name} size={40} />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Selamat datang, {guest.name}!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {guest.albumCount} album · {guest.photoCount} foto
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Foto</h2>
                
                {/* Album Selection Segment */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 mb-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accentColor rounded-l-xl opacity-80" />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-1 px-1">
                    Pilih Album
                  </label>
                  <select
                    value={selectedAlbumSlug}
                    onChange={(e) => setSelectedAlbumSlug(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm mb-3",
                      "bg-white dark:bg-gray-800",
                      "border border-gray-200 dark:border-gray-700 focus:border-accentColor focus:ring-accentColor/20",
                      "text-gray-900 dark:text-white outline-none focus:ring-2 shadow-sm transition-all"
                    )}
                  >
                    {guestAlbums.map(a => (
                      <option key={a.slug} value={a.slug}>{a.name}</option>
                    ))}
                    <option value="new">+ Buat Album Baru</option>
                  </select>

                  {/* Inline New Album Form */}
                  {selectedAlbumSlug === "new" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <input
                          type="text"
                          value={albumForm.name}
                          onChange={(e) => {
                            setAlbumForm((p) => ({ ...p, name: e.target.value }))
                            setAlbumErrors((p) => ({ ...p, name: "" }))
                          }}
                          placeholder="Nama Album Baru (Wajib)"
                          className={cn(
                            "w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-800 border transition-all",
                            albumErrors.name ? "border-red-400 focus:ring-red-400/30" : "border-gray-200 dark:border-gray-700 focus:border-accentColor focus:ring-accentColor/20",
                            "text-gray-900 dark:text-white outline-none focus:ring-2"
                          )}
                        />
                         {albumErrors.name && <p className="text-xs text-red-400 mt-1">{albumErrors.name}</p>}
                      </div>
                      <div>
                        <select
                          value={albumForm.category}
                          onChange={(e) => {
                            setAlbumForm((p) => ({ ...p, category: e.target.value }))
                            setAlbumErrors((p) => ({ ...p, category: "" }))
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-800 border transition-all",
                            albumErrors.category ? "border-red-400" : "border-gray-200 dark:border-gray-700 focus:border-accentColor",
                            "text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accentColor/20"
                          )}
                        >
                          <option value="">Pilih kategori (Wajib)...</option>
                          {GALLERY_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {albumErrors.category && <p className="text-xs text-red-400 mt-1">{albumErrors.category}</p>}
                      </div>
                      <div>
                        <textarea
                          value={albumForm.description}
                          onChange={(e) => setAlbumForm((p) => ({ ...p, description: e.target.value }))}
                          rows={2}
                          placeholder="Deskripsi album (Kosongi tak apa)..."
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-accentColor text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accentColor/20 resize-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drop Zone */}
              <PhotoDropZone onFiles={handlePhotoFiles} inputRef={photoInputRef} />

              {/* Selected photos list */}
              {photos.length > 0 && (
                <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {photos.map((photo, idx) => (
                    <PhotoRow
                      key={photo.preview}
                      photo={photo}
                      idx={idx}
                      onRemove={removePhoto}
                      onUpdate={updatePhotoField}
                      titleError={showTitleErrors && !photo.title.trim()}
                    />
                  ))}
                </div>
              )}

              {photoError && (
                <p className="mt-3 text-sm font-medium text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/10 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4" /> {photoError}
                </p>
              )}

              {submitError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                onClick={handlePhotosSubmit}
                disabled={isSubmitting || photos.length === 0 || (selectedAlbumSlug === 'new' && (!albumForm.name.trim() || !albumForm.category))}
                className={cn(
                  "w-full mt-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200",
                  "bg-accentColor hover:bg-accentColor/90 text-white shadow-[0_0_15px_rgba(14,189,122,0.3)] hover:shadow-[0_0_20px_rgba(14,189,122,0.5)] hover:-translate-y-0.5",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses Data...</>
                ) : (
                  \`Kirim \${photos.length > 0 ? photos.length : ''} Foto ->\`
                )}
              </button>
            </>
          )}

          {/* ── STEP 4: Success ── */}`;

code = code.replace(jsxRegex, newJSX);

fs.writeFileSync(path, code);
console.log('Successfully updated GuestRegistrationModal.tsx');
