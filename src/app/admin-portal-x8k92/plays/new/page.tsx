'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  FileVideo,
  Image as ImageIcon,
} from 'lucide-react';

export default function NewPlayPage() {
  const router = useRouter();

  // Refs for hidden file inputs
  const posterInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('500'); // KES 500 default
  const [description, setDescription] = useState('');
  const [castDetails, setCastDetails] = useState('');
  const [published, setPublished] = useState(true);

  // File URLs & Status States
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFileName, setPosterFileName] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Generic file upload helper
  async function handleFileUpload(
    file: File,
    setLoadingState: (loading: boolean) => void,
    setUrlState: (url: string) => void,
    setFileNameState: (name: string) => void,
    fileType: 'image' | 'video'
  ) {
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    if (fileType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a valid video file (.mp4, .webm, .mov, .mkv).');
      return;
    }

    setLoadingState(true);
    setFileNameState(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'File upload failed');

      setUrlState(data.url);
    } catch (err: any) {
      alert(err.message || 'Error uploading file');
      setFileNameState('');
    } finally {
      setLoadingState(false);
    }
  }

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!videoUrl) {
      alert('Please upload or select the play video recording before publishing.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          price: Number(price) || 0, // Stored as direct number (e.g. 500 stays 500)
          description,
          castDetails,
          posterUrl: posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
          bannerUrl: posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
          published,
          videoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to create play');

      // Redirect back to plays list on success
      router.push('/admin-portal-x8k92/plays');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <Link
          href="/admin-portal-x8k92/plays"
          className="flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plays Catalogue</span>
        </Link>
        <h1 className="text-sm font-black uppercase text-amber-500 tracking-wider">
          Upload New Theatrical Production
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        {/* Title Field */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Play Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. The Samaritan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Author & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Playwright / Author</label>
            <input
              type="text"
              placeholder="e.g. John Lara"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Stream Price (KES) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Production Description / Synopsis *</label>
          <textarea
            rows={3}
            required
            placeholder="Detailed overview of the setbook play..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Cast Details */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Cast & Director Details</label>
          <input
            type="text"
            placeholder="Starring local actors, directed by..."
            value={castDetails}
            onChange={(e) => setCastDetails(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* FILE UPLOADS SECTION */}
        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Media & Video Assets</h3>

          {/* 1. Play Video File Upload */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Play Video File (.mp4, .webm, .mov) *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                placeholder="No video file selected..."
                value={videoFileName || videoUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 text-sm focus:outline-none"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, setUploadingVideo, setVideoUrl, setVideoFileName, 'video');
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-5 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer shrink-0"
              >
                {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <FileVideo className="w-4 h-4 text-amber-500" />}
                <span>Browse Device</span>
              </button>
            </div>
            {uploadingVideo && <p className="text-[11px] text-amber-400 mt-1">Uploading video to server...</p>}
            {videoUrl && !uploadingVideo && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Video ready for streaming.</span>
              </p>
            )}
          </div>

          {/* 2. Poster Image Upload */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Thumbnail Poster Image</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                placeholder="No poster image selected..."
                value={posterFileName || posterUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 text-sm focus:outline-none"
              />
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, setUploadingPoster, setPosterUrl, setPosterFileName, 'image');
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => posterInputRef.current?.click()}
                disabled={uploadingPoster}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-5 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer shrink-0"
              >
                {uploadingPoster ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <ImageIcon className="w-4 h-4 text-amber-500" />}
                <span>Browse Device</span>
              </button>
            </div>
          </div>
        </div>

        {/* PUBLISH TOGGLE */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="published" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Publish immediately (make visible in the public streaming catalogue)
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploadingVideo || uploadingPoster}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-amber-950/30 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Publishing Production...</span>
            </>
          ) : (
            <span>Publish Theatrical Production</span>
          )}
        </button>
      </form>
    </div>
  );
}