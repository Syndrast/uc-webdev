import './style.css'
import { setupCounter } from './counter.ts'
import fantasyBooks from '../json/fantasy-books.json'

// Function to create a card for each book
function createBookCard(book) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'mb-3');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const title = document.createElement('h5');
  title.classList.add('card-title');
  title.textContent = book.title;

  const author = document.createElement('p');
  author.classList.add('card-text');
  author.textContent = `Author: ${book.authors[0].name}`;

  // Add other book properties as needed (e.g., subjects, formats, etc.)

  cardBody.appendChild(title);
  cardBody.appendChild(author);
  cardDiv.appendChild(cardBody);

  return cardDiv;
}

// Get the container where cards will be added
const container = document.getElementById('bookContainer');

// Loop through the books and create cards dynamically
fantasyBooks.results.forEach((book) => {
  const bookCard = createBookCard(book);
  container.appendChild(bookCard);
});


setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
