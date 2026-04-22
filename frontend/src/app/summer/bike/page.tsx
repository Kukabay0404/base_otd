// app/catalog/bike/page.tsx

export default function BikeCatalogPage() {
  return (
    <div className="bg-white text-gray-900 pt-12">
      {/* Баннер */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src="https://img.championat.com/i/z/l/1691732022579177346.jpg"
          alt="Велосипеды"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Велопрогулки</h1>
          <p className="text-xl mb-6">Свежий воздух, природа и активный отдых</p>
        </div>
      </section>

      {/* Блок с описанием */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Прогулки для всей семьи</h2>
          <p className="text-lg leading-relaxed mb-6">
            Велосипедные прогулки — это отличная возможность совместить спорт и отдых. 
            Наши маршруты проходят по живописным лесным дорожкам и паркам, что позволяет 
            насладиться красотой природы и провести время с пользой для здоровья.
          </p>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li>Маршруты разной протяжённости</li>
            <li>Велосипеды для взрослых и детей</li>
            <li>Специальные велокресла для малышей</li>
            <li>Велосипеды в аренду на час и целый день</li>
          </ul>
        </div>
        <div>
          <img
            src="https://www.tripsavvy.com/thmb/TvAYkohQhhIIlRhi65-BMIEsM3I=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Couplemountainbikingthroughaforest-89d8c329c8e04489a4fe22a5d5c93f10.jpg"
            alt="Катание на велосипеде"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Галерея */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Фотогалерея</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvMjc4LXRlZDMwODMtZXllLmpwZw.jpg" alt="Bike 1" className="rounded-xl shadow-md" />
            <img src="https://i.novgorod.ru/news/images/72/43/914372/big_914372.jpg" alt="Bike 2" className="rounded-xl shadow-md" />
            <img src="https://cdn.culture.ru/images/1be009b9-2321-5aa1-88f0-2ccd99863f95" alt="Bike 3" className="rounded-xl shadow-md" />
          </div>
        </div>
      </section>
    </div>
  );
}
