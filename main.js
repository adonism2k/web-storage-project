import "flowbite";

const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");
const themeToggleBtn = document.getElementById("theme-toggle");


if (localStorage.getItem("color-theme") === "dark" || (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  themeToggleLightIcon.classList.remove("hidden");
} else {
  themeToggleDarkIcon.classList.remove("hidden");
}

themeToggleBtn.addEventListener("click", function () {
  // toggle icons inside button
  themeToggleDarkIcon.classList.toggle("hidden");
  themeToggleLightIcon.classList.toggle("hidden");

  // if set via local storage previously
  if (localStorage.getItem("color-theme")) {
    if (localStorage.getItem("color-theme") === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
    }

    // if NOT set via local storage previously
  } else {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    }
  }
});

const books = [];
const SAVED_EVENT = "saved-book";
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const searchInput = document.getElementById("searchBookInput");
const allBooksButton = document.getElementById("allBooks");
const notCompletedButton = document.getElementById("notCompleted");
const doneReadingButton = document.getElementById("doneReading");

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function filterBookByStatus(status) {
  let filteredBooks;
  if (status === "all") {
    filteredBooks = books;
  } else if (status === "doneReading") {
    filteredBooks = books.filter((book) => book.isCompleted === true);
  } else if (status === "notCompleted") {
    filteredBooks = books.filter((book) => book.isCompleted === false);
  }

  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    bookList.innerHTML += bookElement;
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addNewBook() {
  const id = generateId();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isCompleted = document.getElementById("isCompleted").checked;
  const bookObject = generateBookObject(id, title, author, year, isCompleted);
  const addBookForm = document.getElementById("addBookForm");

  books.push(bookObject);

  addBookForm.reset();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  book.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  book.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const book = findBookIndex(bookId);

  if (book === -1) return;

  books.splice(book, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;
  const html = `
    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
      <th scope="row" class="flex items-center py-4 px-6 text-gray-900 whitespace-nowrap dark:text-white">
        <div class="pl-3">
          <div class="text-base font-semibold">${title}</div>
        </div>
      </th>
      <td class="py-4 px-6">
        ${author}
      </td>
      <td class="py-4 px-6">
        ${year}
      </td>
      <td class="py-4 px-6">
        <div class="flex items-center">
          ${
            isCompleted
              ? `<div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> Done`
              : `<div class="h-2.5 w-2.5 rounded-full bg-red-400 mr-2"></div> Not Yet`
          }
        </div>
      </td>
      <td class="py-4 px-6 h-full flex flex-col whitespace-nowrap items-center gap-2 md:flex-row">
        ${
          isCompleted
            ? `
            <button type="button" id="undoBookButton-${id}" data-tooltip-target="completeTooltip" class="text-white bg-amber-700 hover:bg-amber-800 focus:ring-4 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm px-3 py-1 text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800">
              Undo Complete
            </button>
            `
            : `<button type="button" id="completedBookButton-${id}" data-tooltip-target="completeTooltip" class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
              Mark as Complete
            </button>`
        }
        <button type="button" id="deleteBook-${id}" data-tooltip-target="deleteTooltip" class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
          Delete
        </button>
      </td>
    </tr>
  `;

  return html;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("addBookForm");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addNewBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {});

document.addEventListener(RENDER_EVENT, function () {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    bookList.innerHTML += bookElement;
  }
});

document.addEventListener(RENDER_EVENT, () => {
  for (const book of books) {
    const deleteBtn = document.getElementById(`deleteBook-${book.id}`);
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function (event) {
        event.preventDefault();
        deleteBook(book.id);
      });
    }

    const undoBtn = document.getElementById(`undoBookButton-${book.id}`);
    if (undoBtn) {
      undoBtn.addEventListener("click", function (event) {
        event.preventDefault();
        undoBookFromCompleted(book.id);
      });
    }

    const completeBtn = document.getElementById(
      `completedBookButton-${book.id}`
    );
    if (completeBtn) {
      completeBtn.addEventListener("click", function (event) {
        event.preventDefault();
        addBookToCompleted(book.id);
      });
    }
  }
});

searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(searchValue.toLowerCase()));
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    bookList.innerHTML += bookElement;
  }
});

allBooksButton.addEventListener("click", () => {
  filterBookByStatus("all");
  doneReadingButton.classList.remove("active");
  notCompletedButton.classList.remove("active");
  doneReadingButton.classList.add("notActive");
  notCompletedButton.classList.add("notActive");
  allBooksButton.classList.add("active");
})

notCompletedButton.addEventListener("click", () => {
  filterBookByStatus("notCompleted");
  allBooksButton.classList.remove("active");
  doneReadingButton.classList.remove("active");
  allBooksButton.classList.add("notActive");
  doneReadingButton.classList.add("notActive");
  notCompletedButton.classList.add("active");
})

doneReadingButton.addEventListener("click", () => {
  filterBookByStatus("doneReading");
  allBooksButton.classList.remove("active");
  notCompletedButton.classList.remove("active");
  allBooksButton.classList.add("notActive");
  notCompletedButton.classList.add("notActive");
  doneReadingButton.classList.add("active");
})
