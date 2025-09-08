import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Öğrenci Takip Uygulaması
          </h1>
          <p className="text-lg text-text-secondary">
            Yatılı öğrenci kurumları için ARDN puan sistemli takip uygulaması
          </p>
        </div>
        
        <div className="bg-surface rounded-xl p-6 max-w-md mx-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto">
              <span className="material-symbols-outlined text-2xl text-background">
                school
              </span>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Hoşgeldiniz
              </h2>
              <p className="text-text-secondary">
                Proje kurulumu tamamlandı. Şimdi giriş sistemini ve diğer özellikleri geliştirebiliriz.
              </p>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="text-sm text-text-secondary space-y-2">
                <p>✓ Next.js 14 kurulumu tamamlandı</p>
                <p>✓ TailwindCSS yapılandırıldı</p>
                <p>✓ Stitch tasarımları analiz edildi</p>
                <p className="text-primary font-medium">→ Sonraki: Database şeması kurulumu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
