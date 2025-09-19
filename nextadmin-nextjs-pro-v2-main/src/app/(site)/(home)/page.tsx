// app/page.tsx
export const dynamic = "force-static"; // render 100% estático en build

export default function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
        ¡Bienvenido!
      </h1>
    </div>
  );
}
