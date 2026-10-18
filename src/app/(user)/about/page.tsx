export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-white mb-6">About Our Setbook Productions</h1>
      
      <div className="space-y-8 text-zinc-300 leading-relaxed">
        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-amber-500 mb-3">Our Mission</h2>
          <p>
            To bring secondary school setbooks and classical literature to vivid theatrical life through professional acting, making revision engaging, accessible, and immersive for students and literature enthusiasts across East Africa.
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-amber-500 mb-3">Our Vision</h2>
          <p>
            To become the premier digital stage for African literature and dramatic arts, empowering local artists and leveraging secure technology to distribute educational cinematic content seamlessly.
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-amber-500 mb-3">The Group & Cast</h2>
          <p>
            We are an ensemble of seasoned professional stage actors, directors, and educators dedicated to faithful interpretation of curriculum setbooks. Every production undergoes rigorous review to ensure dramatic excellence and curriculum alignment.
          </p>
        </section>
      </div>
    </div>
  );
}