export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Контакты */}
        <div>
          <h3 className="font-semibold mb-4">Контакты</h3>
          <p>Зона отдыха «Лесное Озеро»</p>
          <p>Караганда, Малотимофеевка-2</p>
          <p className="mt-2">Отдел продаж: <a href="tel:+77750070030" className="hover:underline">+7 775 007 00 30</a></p>
          <p>Ресепшн: <a href="tel:+77750070037" className="hover:underline">+7 775 007 00 37</a></p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="p-2 border rounded-full hover:bg-teal-900 hover:text-white transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-teal-900 hover:text-white transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-teal-900 hover:text-white transition">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* Проживание */}
        <div>
          <h3 className="font-semibold mb-4">Проживание</h3>
          <ul className="space-y-2">
            <li><a href="/rooms" className="hover:underline">Номера</a></li>
            <li><a href="/cabins" className="hover:underline">Срубы</a></li>
          </ul>
        </div>

        {/* Зимний отдых */}
        <div>
          <h3 className="font-semibold mb-4">Зимний отдых</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Лыжи</a></li>
            <li><a href="#" className="hover:underline">Коньки</a></li>
            <li><a href="#" className="hover:underline">Сноуборд</a></li>
            <li><a href="#" className="hover:underline">Катание на хаски</a></li>
            <li><a href="#" className="hover:underline">Прокат снегохода</a></li>
          </ul>
        </div>

        {/* Летний отдых */}
        <div>
          <h3 className="font-semibold mb-4">Летний отдых</h3>
          <ul className="space-y-2">
            <li><a href="/waterpool" className="hover:underline">Аквапарк и бассейн</a></li>
            <li><a href="/football" className="hover:underline">Футбол, пейнтбол, велосипеды</a></li>
            <li><a href="/quad" className="hover:underline">Квадроциклы</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-12">
        © {new Date().getFullYear()} Лесное Озеро. Все права защищены.
      </div>
    </footer>
  );
}
