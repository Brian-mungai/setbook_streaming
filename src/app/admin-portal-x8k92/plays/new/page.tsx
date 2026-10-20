'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as tus from 'tus-js-client';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  FileVideo,
  Image as ImageIcon,
} from 'lucide-react';

export default function NewPlayPage() {
  const router = useRouter();

  // Hidden File Inputs
  const posterInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('500'); // KES 500 default
  const [description, setDescription] = useState('');
  const [castDetails, setCastDetails] = useState('');
  const [published, setPublished] = useState(true);

  // Media States
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFileName, setPosterFileName] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [bunnyVideoId, setBunnyVideoId] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // -------------------------------------------------------------
  // 1. Poster Image Upload (Supabase Storage via /api/admin/upload)
  // -------------------------------------------------------------
  async function handlePosterUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingPoster(true);
    setPosterFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Poster upload failed');

      setPosterUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'Error uploading poster');
      setPosterFileName('');
    } finally {
      setUploadingPoster(false);
    }
  }

  // -------------------------------------------------------------
  // 2. Video Stream Direct Upload to Bunny.net (TUS Protocol)
  // -------------------------------------------------------------
  async function handleVideoUpload(file: File) {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (.mp4, .webm, .mov, .mkv).');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a play title before selecting the video file.');
      return;
    }

    setUploadingVideo(true);
    setVideoFileName(file.name);
    setVideoProgress(0);

    try {
      // Step A: Request Bunny Video Container Placeholder
      const initRes = await fetch('/api/admin/bunny/init-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.message || 'Failed to initialize Bunny.net video container');

      const { videoId, libraryId, expirationTime, signature } = initData;

      // Step B: Direct Resumable Stream to Bunny CDN
      await new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: 'https://video.bunnycdn.com/tusupload',
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: String(expirationTime),
            VideoId: videoId,
            LibraryId: String(libraryId),
          },
          metadata: {
            filetype: file.type,
            title: title,
          },
          onError: (err) => reject(err),
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            setVideoProgress(percentage);
          },
          onSuccess: () => resolve(true),
        });

        upload.start();
      });

      setBunnyVideoId(videoId);
    } catch (err: any) {
      console.error('Video upload error:', err);
      alert('Error uploading video to Bunny.net: ' + (err.message || 'Failed'));
      setVideoFileName('');
      setBunnyVideoId('');
    } finally {
      setUploadingVideo(false);
    }
  }

  // -------------------------------------------------------------
  // 3. Save Production Record to Database
  // -------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!bunnyVideoId) {
      alert('Please select and finish uploading the play video before publishing.');
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
          price: Number(price) || 0,
          description,
          castDetails,
          posterUrl: posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
          bannerUrl: posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
          published,
          bunnyVideoId, // 👈 Saved directly to database for Bunny Stream playback!
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to create play');

      // Redirect back to plays catalogue on success
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

          {/* 1. Play Video File Upload (Bunny Stream TUS) */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Play Video File (.mp4, .webm, .mov, .mkv) *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                placeholder="No video file selected..."
                value={videoFileName ? `${videoFileName} ${bunnyVideoId ? '(Ready)' : ''}` : ''}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 text-sm focus:outline-none"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/mkv,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
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

            {/* Video Progress Bar */}
            {uploadingVideo && (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] text-amber-400">Uploading directly to Bunny Stream ({videoProgress}%)...</p>
                <div className="w-full bg-zinc-950 border border-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-200" style={{ width: `${videoProgress}%` }} />
                </div>
              </div>
            )}

            {bunnyVideoId && !uploadingVideo && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Video processed & ready for CDN streaming.</span>
              </p>
            )}
          </div>

          {/* 2. Poster Image Upload (Supabase Storage) */}
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
                  if (file) handlePosterUpload(file);
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
            {posterUrl && !uploadingPoster && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Poster uploaded to Supabase Storage.</span>
              </p>
            )}
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