"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Plus, 
  Trash2, 
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Pencil
} from "lucide-react";

export default function AdminHeroPage() {
  const { 
    heroImages, 
    addHeroImage, 
    editHeroImage,
    deleteHeroImage,
    session
  } = useApp();

  // Hero Form states
  const [isAddingHero, setIsAddingHero] = useState(false);
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
  const [heroForm, setHeroForm] = useState({ desktopImage: "", mobileImage: "", order: 0 });
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "desktop") setIsUploadingDesktop(true);
    else setIsUploadingMobile(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.token || ""}`
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setHeroForm(p => ({
          ...p,
          [type === "desktop" ? "desktopImage" : "mobileImage"]: data.url
        }));
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload error: ${err.message || "Could not connect to upload API"}`);
    } finally {
      if (type === "desktop") setIsUploadingDesktop(false);
      else setIsUploadingMobile(false);
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.desktopImage || !heroForm.mobileImage) {
      alert("Both desktop and mobile images are required.");
      return;
    }

    if (editingHeroId) {
      await editHeroImage(editingHeroId, {
        desktopImage: heroForm.desktopImage,
        mobileImage: heroForm.mobileImage,
        order: Number(heroForm.order)
      });
      setEditingHeroId(null);
      setHeroForm({ desktopImage: "", mobileImage: "", order: 0 });
    } else {
      if (heroImages.length >= 4) {
        alert("Maximum limit of 4 hero slides reached. Please delete an existing slide first.");
        return;
      }
      await addHeroImage(heroForm.desktopImage, heroForm.mobileImage);
      setIsAddingHero(false);
      setHeroForm({ desktopImage: "", mobileImage: "", order: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Hero Slider Images</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage active slides rotating on the storefront homepage ({heroImages.length}/4 slides)</p>
        </div>
        {!isAddingHero && !editingHeroId && (
          <button
            disabled={heroImages.length >= 4}
            onClick={() => setIsAddingHero(true)}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-sm"
            title={heroImages.length >= 4 ? "Maximum limit of 4 hero slides reached" : "Add New Slide"}
          >
            <Plus size={16} /> 
            <span>Add New Slide</span>
          </button>
        )}
      </div>

      {!isAddingHero && !editingHeroId ? (
        <div className="grid grid-cols-1 gap-6">
          {heroImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-500 shadow-xs">
              <ImageIcon size={40} className="mx-auto text-zinc-300 mb-3" />
              <p className="text-sm font-semibold">No dynamic hero images found.</p>
              <p className="text-xs text-zinc-400 mt-1">The slider is currently using default static fallback slides.</p>
              <button
                onClick={() => setIsAddingHero(true)}
                className="mt-4 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Create First Custom Slide
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroImages.map((image, index) => (
                <div key={image._id || index} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="p-4 space-y-4">
                    {/* Slide Info */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-zinc-100 text-zinc-800 font-bold px-2 py-0.5 rounded uppercase">
                        Slide #{index + 1}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono">
                        Order: {image.order}
                      </span>
                    </div>

                    {/* Images Previews */}
                    <div className="space-y-3">
                      {/* Desktop */}
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Desktop Aspect</span>
                        <div className="aspect-[21/9] rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 relative group">
                          <img src={image.desktopImage} alt="Desktop slide view" className="w-full h-full object-cover" />
                          <a href={image.desktopImage} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={16} className="text-white" />
                          </a>
                        </div>
                      </div>

                      {/* Mobile */}
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Mobile Aspect</span>
                        <div className="aspect-[4/3] w-2/3 mx-auto rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 relative group">
                          <img src={image.mobileImage} alt="Mobile slide view" className="w-full h-full object-cover" />
                          <a href={image.mobileImage} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={16} className="text-white" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-zinc-100 p-4 bg-zinc-50/50 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setEditingHeroId(image._id || null);
                        setHeroForm({
                          desktopImage: image.desktopImage,
                          mobileImage: image.mobileImage,
                          order: image.order || 0
                        });
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      <Pencil size={12} />
                      <span>Edit Slide</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to remove this hero slide?")) {
                          if (image._id) deleteHeroImage(image._id);
                        }
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Remove Slide</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ADD / EDIT SLIDE FORM */
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-zinc-200 pb-4">
            <button 
              onClick={() => {
                setIsAddingHero(false);
                setEditingHeroId(null);
                setHeroForm({ desktopImage: "", mobileImage: "", order: 0 });
              }}
              className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-xl transition-colors bg-white text-zinc-700"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {editingHeroId ? "Edit Hero Slide" : "Add New Hero Slide"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {editingHeroId ? "Update desktop and mobile slides" : "Upload matching desktop and mobile slides"}
              </p>
            </div>
          </div>

          <form onSubmit={handleHeroSubmit} className="space-y-6 max-w-2xl bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">
              
              {/* DESKTOP */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Desktop Image (Width 2000px Recommended) *</label>
                <div className="flex items-start space-x-4 p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
                  {heroForm.desktopImage ? (
                    <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                      <div className="w-24 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-xs relative group">
                        <img src={heroForm.desktopImage} alt="Desktop slide preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeroForm(p => ({ ...p, desktopImage: "" }))}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-12 rounded-lg border border-dashed border-zinc-300 bg-white flex-shrink-0 flex items-center justify-center text-zinc-400">
                      <span className="text-[9px] uppercase font-bold tracking-tight text-center px-1 font-mono">No Image</span>
                    </div>
                  )}
                  <div className="flex-grow space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHeroImageUpload(e, "desktop")}
                      className="block w-full text-xs text-zinc-500
                        file:mr-4 file:py-1.5 file:px-3
                        file:rounded-md file:border file:border-rose-200
                        file:text-xs file:font-bold
                        file:bg-rose-50 file:text-rose-700
                        hover:file:bg-rose-100 file:cursor-pointer
                        transition-colors focus:outline-none"
                    />
                    {isUploadingDesktop ? (
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider animate-pulse">Uploading Desktop to Cloudinary...</span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-zinc-500 leading-tight">
                        Upload a wide banner to be displayed on tablets and desktop monitors.
                      </p>
                    )}
                    <input
                      type="text"
                      required
                      value={heroForm.desktopImage}
                      onChange={() => {}}
                      className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* MOBILE */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Mobile Image (Width 800px Recommended) *</label>
                <div className="flex items-start space-x-4 p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
                  {heroForm.mobileImage ? (
                    <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-xs relative group">
                        <img src={heroForm.mobileImage} alt="Mobile slide preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeroForm(p => ({ ...p, mobileImage: "" }))}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-zinc-300 bg-white flex-shrink-0 flex items-center justify-center text-zinc-400">
                      <span className="text-[9px] uppercase font-bold tracking-tight text-center px-1 font-mono">No Image</span>
                    </div>
                  )}
                  <div className="flex-grow space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHeroImageUpload(e, "mobile")}
                      className="block w-full text-xs text-zinc-500
                        file:mr-4 file:py-1.5 file:px-3
                        file:rounded-md file:border file:border-rose-200
                        file:text-xs file:font-bold
                        file:bg-rose-50 file:text-rose-700
                        hover:file:bg-rose-100 file:cursor-pointer
                        transition-colors focus:outline-none"
                    />
                    {isUploadingMobile ? (
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider animate-pulse">Uploading Mobile to Cloudinary...</span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-zinc-500 leading-tight">
                        Upload a portrait banner to be displayed on mobile devices.
                      </p>
                    )}
                    <input
                      type="text"
                      required
                      value={heroForm.mobileImage}
                      onChange={() => {}}
                      className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* ORDER */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Display Order (Lower number renders first)</label>
                <input
                  type="number"
                  value={heroForm.order}
                  onChange={(e) => setHeroForm(p => ({ ...p, order: Number(e.target.value) }))}
                  className="w-full text-xs p-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-rose-500 bg-zinc-50/50"
                  placeholder="0"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t border-zinc-200">
              <button
                type="submit"
                disabled={isUploadingDesktop || isUploadingMobile}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                {editingHeroId ? "Save Changes" : "Publish Slide"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingHero(false);
                  setEditingHeroId(null);
                  setHeroForm({ desktopImage: "", mobileImage: "", order: 0 });
                }}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider border border-zinc-300 transition-colors shadow-xs"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
