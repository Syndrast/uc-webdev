import { createBookCard } from './main';

export function setupCounter(element: HTMLButtonElement, books: any[], container: HTMLElement) {
  let ascending = true; // Variable para alternar entre ascendente y descendente

  const updateButtonText = () => {
    element.textContent = ascending ? 'Ordenar Descendente' : 'Ordenar Ascendente';
  };

  const sortBooks = () => {
    // Ordenar los libros según el estado actual (ascendente o descendente)
    books.sort((a, b) => {
      if (ascending) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

    // Limpiar el contenedor y volver a renderizar las tarjetas
    container.innerHTML = '';
    books.forEach((book) => {
      const bookCard = createBookCard(book);
      container.appendChild(bookCard);
    });

    // Alternar el estado para el próximo clic
    ascending = !ascending;

    // Actualizar el texto del botón
    updateButtonText();
  };

  // Inicializar el texto del botón
  updateButtonText();

  // Agregar el evento de clic al botón
  element.addEventListener('click', sortBooks);
}
