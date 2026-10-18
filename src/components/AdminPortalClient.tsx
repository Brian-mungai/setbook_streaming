'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Film,
  Plus,
  Trash2,
  Users,
  CreditCard,
  Loader2,
  CheckCircle,
  FileVideo,
  Image as ImageIcon,
  X,
} from 'lucide-react';

interface AdminPortalProps {
  plays?: any[];
  users?: any[];
  transactions?: any[];
}

export default function AdminPortalClient({
  plays = [],
  users = [],
  transactions = [],
}: AdminPortalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plays' | 'users' | 'transactions'>('plays');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Refs for the "Browse Device" buttons
  const posterInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('500');
  const [description, setDescription] = useState('');
  const [castDetails, setCastDetails] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Thumbnail / Poster Image state
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFileName, setPosterFileName] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Recorded Play Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [submittingPlay, setSubmittingPlay] = useState(false);
  const [deletingPlayId, setDeletingPlayId] = useState<string | null>(null);

  // Upload helper for both Poster Image and Play Video
  async function handleFileUpload(
    file: File,
    setLoadingState: (loading: boolean) => void,
    setUrlState: (url: string) => void,
    setFileNameState: (name: string) => void,
    fileType: 'image' | 'video'
  ) {
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select a valid image file for the thumbnail.');
      return;
    }
    if (fileType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a valid video file (.mp4, .webm, .mov, .mkv) for the play.');
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
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setUrlState(data.url);
    } catch (err: any) {
      alert(err.message || 'Error uploading file');
      setFileNameState('');
    } finally {
      setLoadingState(false);
    }
  }

  // Save Play + Attach Video
  async function handleCreatePlay(e: React.FormEvent) {
    e.preventDefault();

    if (!videoUrl) {
      alert('Please click "Browse Device" under Play Video / Recording to select the recorded play video.');
      return;
    }

    setSubmittingPlay(true);

    try {
      const res = await fetch('/api/admin/plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          price: parseFloat(price),
          description: castDetails
            ? `${description}\n\nCast & Production: ${castDetails}`
            : description,
          castDetails,
          isPublished,
          posterUrl,
          scenes: [
            {
              title: 'Full Play',
              description,
              sequence: 1,
              videoUrl,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save play');

      // Reset form & close modal
      setTitle('');
      setAuthor('');
      setPrice('500');
      setDescription('');
      setCastDetails('');
      setPosterUrl('');
      setPosterFileName('');
      setVideoUrl('');
      setVideoFileName('');
      setIsPublished(true);
      setIsAddModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingPlay(false);
    }
  }

  // Delete Play
  async function handleDeletePlay(playId: string) {
    if (!confirm('Are you sure you want to delete this play?')) return;
    setDeletingPlayId(playId);
    try {
      const res = await fetch(`/api/admin/plays/${playId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete play');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingPlayId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Management Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage theatrical plays, video uploads, user access, and transactions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80 w-fit">
        <button
          onClick={() => setActiveTab('plays')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'plays'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Plays ({plays.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Transactions ({transactions.length})</span>
        </button>
      </div>

      {/* PLAYS GRID TAB */}
      {activeTab === 'plays' && (
        <>
          {plays.length === 0 ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-3">
              <Film className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold">No setbook plays uploaded yet.</p>
              <p className="text-xs text-zinc-500">Click "+ Add New" above to upload your first play recording.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plays.map((play) => (
                <div key={play.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="relative aspect-[16/9] bg-zinc-950">
                    {play.posterUrl ? (
                      <img src={play.posterUrl} alt={play.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Film className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleDeletePlay(play.id)}
                        disabled={deletingPlayId === play.id}
                        className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-xl transition-colors shadow-lg cursor-pointer"
                        title="Delete Play"
                      >
                        {deletingPlayId === play.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{play.title}</h3>
                      {play.author && <p className="text-xs text-amber-400 font-medium mb-2">By {play.author}</p>}
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{play.description}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400">KES {play.price}</span>
                      <span className="text-zinc-400">{play.scenes?.length || 0} Video Scene(s)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Email / Phone</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Entitlements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/40">
                  <td className="p-4 font-bold text-white">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.name || 'User'}</td>
                  <td className="p-4 font-mono text-zinc-400">{u.email || u.phone || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400">{u._count?.entitlements || 0} unlocked items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-4 font-bold">Receipt / ID</th>
                <th className="p-4 font-bold">User Phone</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40">
                  <td className="p-4 font-mono text-amber-400">{tx.mpesaReceiptNumber || tx.checkoutRequestId?.slice(0, 10) || tx.id}</td>
                  <td className="p-4 font-mono">{tx.phone}</td>
                  <td className="p-4 font-bold text-white">KES {tx.amount}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD NEW SETBOOK PLAY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Add New Setbook Play</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlay} className="space-y-4">
              {/* Play Title */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Play Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parliament of Owls"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Playwright / Author & Price (KES) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Playwright / Author
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adipo Sidang"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis of the production..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Thumbnail / Poster Image */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Thumbnail / Poster Image
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="No file selected..."
                    value={posterFileName || posterUrl}
                    className="flex-1 bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-400 text-sm focus:outline-none"
                  />
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(
                          file,
                          setUploadingPoster,
                          setPosterUrl,
                          setPosterFileName,
                          'image'
                        );
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => posterInputRef.current?.click()}
                    disabled={uploadingPoster}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer"
                  >
                    {uploadingPoster ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Browse Device</span>
                  </button>
                </div>
              </div>

              {/* Play Video / Recording Upload */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Play Video / Recording (MP4, WebM, MOV) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="No video file selected..."
                    value={videoFileName || videoUrl}
                    className="flex-1 bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-400 text-sm focus:outline-none"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(
                          file,
                          setUploadingVideo,
                          setVideoUrl,
                          setVideoFileName,
                          'video'
                        );
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                      <FileVideo className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Browse Device</span>
                  </button>
                </div>
                {uploadingVideo && (
                  <p className="text-[11px] text-amber-400 mt-1.5">
                    Uploading play video from your computer...
                  </p>
                )}
                {videoUrl && !uploadingVideo && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Video uploaded: {videoUrl}</span>
                  </p>
                )}
              </div>

              {/* Cast & Production Details */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Cast & Production Details
                </label>
                <input
                  type="text"
                  placeholder="Starring Jane Doe, Directed by John Smith"
                  value={castDetails}
                  onChange={(e) => setCastDetails(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Publish immediately checkbox */}
              <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-xs text-zinc-300">
                  Publish immediately (visible on main site catalogue)
                </span>
              </label>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPlay || uploadingPoster || uploadingVideo}
                  className="bg-[#d97706] hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {submittingPlay ? 'Saving...' : 'Save Play'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}