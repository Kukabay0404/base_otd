
export default function QuadCatalogPage() {
  return (
    <div className="bg-white text-gray-900 pt-12">
      {/* Баннер */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src="https://kvadro-land.ru/55-2-1.jpg"
          alt="Квадроциклы"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Квадроциклы</h1>
          <p className="text-xl mb-6">Экстремальный отдых для настоящих драйвовых людей</p>
        </div>
      </section>

      {/* Блок с описанием */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Адреналин и свобода</h2>
          <p className="text-lg leading-relaxed mb-6">
            Поездка на квадроцикле — это возможность испытать яркие эмоции, насладиться природой 
            и почувствовать полную свободу движения. Отлично подойдёт как для активного отдыха, 
            так и для корпоративных мероприятий.
          </p>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li>Маршруты разной сложности</li>
            <li>Прокат и аренда квадроциклов</li>
            <li>Опытные инструкторы</li>
            <li>Экипировка включена</li>
          </ul>
        </div>
        <div>
          <img
            src="https://www.slivki.by/znijki-media/w1044_644/default/1009921/1648645030_Screenshot_1.jpg"
            alt="Катание на квадроцикле"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Галерея */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Фотогалерея</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img src="https://avatars.mds.yandex.net/get-znatoki/1540166/2a00000180b230036754c3bf98fac563a9d3/orig" alt="Quad 1" className="rounded-xl shadow-md" />
            <img src="https://a.d-cd.net/3b73fc9s-1920.jpg" alt="Quad 2" className="rounded-xl shadow-md" />
            <img src="https://avatars.mds.yandex.net/get-ydo/2428621/2a000001764ec36a5b828f3396e0a8fa73f1/diploma" alt="Quad 3" className="rounded-xl shadow-md" />
          </div>
        </div>
      </section>
    </div>
  );
}
