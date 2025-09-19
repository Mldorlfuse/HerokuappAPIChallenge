# 🧪 API-тесты на Playwright

![Playwright](https://playwright.dev/img/playwright-logo.svg)

## 📌 Описание
Автоматизированные API тесты для веб-приложения [[Saucedemo](https://apichallenges.herokuapp.com/) с использованием [Playwright](https://playwright.dev/).  

Список выполненных челленджей:
- ✅ Получение токена
- ✅ Получить список заданий
- ✅ Получить список дел
- ✅ Получить 404 при запросе к методу не в множественном числе
- ✅ Получить данные конкретного todos
- ✅ Получить 404 при поиске несуществующего todos
- ✅ Получить выполненные todos
- ✅ Получить заголовок и код ответа при запросе HEAD к todos
- ✅ Создать новый todo с помощью POST запроса
- ✅ POST: ошибка по полю doneStatus
- ✅ POST: ошибка — заголовок превышает максимально допустимую длину
- ✅ POST: ошибка — описание превышает максимально допустимую длину
- ✅ POST: успешное создание задачи с максимальными значениями полей
- ✅ POST: ошибка — payload превышает 5000 символов
- ✅ POST: ошибка — нераспознанное поле в payload
- ✅ PUT: безуспешное создание задачи
- ✅ POST: успешное обновление задачи
- ✅ POST: обновление несуществующей задачи (404)
- ✅ PUT: обновление задачи (полный payload)
- ✅ PUT: обновление задачи (только обязательные поля)
- ✅ PUT: ошибка — отсутствует заголовок
- ✅ PUT: ошибка — отсутствует заголовок (дубль)
- ✅ DELETE: успешное удаление задачи
- ✅ GET /todos с Accept = application/xml
- ✅ GET /todos с Accept = application/json
- ✅ GET /todos с Accept = */*
- ✅ GET /todos с Accept = application/xml, application/json
- ✅ GET /todos без Accept (по умолчанию JSON)
- ✅ GET /todos с Accept = application/gzip (ожидаемый 406)
- ✅ POST /todos (Content-Type: XML, Accept: XML)
- ✅ POST /todos (Content-Type: JSON, Accept: JSON)
- ✅ POST /todos с неподдерживаемым Content-Type (415)
- ✅ GET /challenger/{guid} — получение прогресса
- ✅ PUT /challenger/{guid} — восстановление прогресса
  
---

## 🚀 Установка

### 1. Клонировать репозиторий
```
git clone https://github.com/Mldorlfuse/HerokuappAPIChallenge.git

cd HerokuappAPIChallenge
```

### 2. Установить зависимости
```
npm install
```

---

## ▶️ Запуск тестов

### Все тесты
```
npx playwright test
```
