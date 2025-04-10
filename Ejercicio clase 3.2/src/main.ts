import './style.css'
import { setupCounter } from './counter.ts'
import fantasyBooks from '../json/fantasy-books.json'

// Function to create a card for each book
export function createBookCard(book) {
  // (1.1) Accede al DOM para crear un elemento div que sera el contenedor de la tarjeta
  // y asignarle la clase card y mb-3
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'mb-3');

  // (1.2) Accede al DOM para crear un elemento div que sera el cuerpo de la tarjeta
  // y asignarle la clase card-body
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  // (1.3) Accede al DOM para crear un elemento h5 que sera el titulo del libro,
  // asignarle la clase card-title, y asignale el nombre del libro
  const title = document.createElement('h5');
  title.classList.add('card-title');
  title.textContent = book.title;

  // (1.4) Accede al DOM para crear un elemento p que sera el autor del libro,
  // asignarle la clase card-text, y asignarle el nombre del autor
  const author = document.createElement('p');
  author.classList.add('card-text');
  author.textContent = `Author: ${book.authors[0].name}`;

  // Add other book properties as needed (e.g., subjects, formats, etc.)

  // (2.1) Accede al DOM para crear un elemento div que sera el contenedor de la imagen y el contenido
  const cardContent = document.createElement('div');
  cardContent.classList.add('d-flex', 'align-items-start'); // Flexbox para alinear la imagen y el contenido

  // (2.2) Accede al DOM para crear in elemento img que sera la imagen del libro
  // y asignarle la clase card-img-top, y asignarle la imagen del libro
  const img = document.createElement('img');
  img.classList.add('card-img-top');
  img.src = book.formats['image/jpeg'];
  img.alt = book.title;


  // (1.5) Crea una jerarquia de elementos para la tarjeta
  // (1.5.1) Agrega el titulo y el autor al cuerpo de la tarjeta
  // (1.5.2) Agrega el cuerpo de la tarjeta al contenedor de la tarjeta
  cardBody.appendChild(title);
  cardBody.appendChild(author);

  // (2.2) Agrega la imagen al contenedor de la tarjeta
  cardContent.appendChild(img); // Agregar la imagen al contenedor
  cardContent.appendChild(cardBody); // Agregar el cuerpo de la tarjeta al contenedor
  cardDiv.appendChild(cardContent);


  return cardDiv;
}

// Get the container where cards will be added
// (1.6) Accede al DOM para obtener el contenedor donde se agregaran las tarjetas
const container = document.getElementById('bookContainer');

// Loop through the books and create cards dynamically
fantasyBooks.results.forEach((book) => {
  const bookCard = createBookCard(book);
  // (1.7) Agrega la tarjeta al contenedor
  container.appendChild(bookCard);
});

// (1.8) Accede al DOM para obtener el elemento con id counter
setupCounter(
  document.querySelector<HTMLButtonElement>('#counter')!,
  fantasyBooks.results,
  container
);
