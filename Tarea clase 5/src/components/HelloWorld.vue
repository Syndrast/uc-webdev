<template>
  <v-app>
    <v-container>
      <!-- Sección superior del formulario -->
      <v-text-field v-model="book.name" label="Nombre"></v-text-field>
      <v-text-field v-model="book.author" label="Autor"></v-text-field>
      <v-text-field v-model="book.year" label="Año"></v-text-field>
      <v-select v-model="book.genres" :items="genres" label="Géneros" multiple chips closable-chips></v-select> <!-- Added chips for better UX -->

      <!-- Botones condicionales -->
      <v-btn v-if="!isEditing" color="primary" @click="addBook">Agregar</v-btn>
      <div v-else>
        <v-btn color="success" @click="submitUpdate" class="mr-2">Actualizar</v-btn>
        <v-btn color="grey" @click="cancelEdit">Cancelar</v-btn>
      </div>

      <!-- Sección inferior: Tabla de datos -->
      <v-data-table
        :headers="headers"
        :items="books"
        class="elevation-1 mt-4"
      >
        <!-- Slots para mostrar datos (sin cambios) -->
        <template v-slot:item.name="{ item }">
          {{ item.data.name }}
        </template>
        <template v-slot:item.author="{ item }">
          {{ item.data.author }}
        </template>
        <template v-slot:item.year="{ item }">
          {{ item.data.year }}
        </template>
        <template v-slot:item.genres="{ item }">
          <!-- Improved display for genres -->
          <v-chip
            v-for="genre in item.data.genres"
            :key="genre"
            class="ma-1"
            small
          >
            {{ genre }}
          </v-chip>
          <span v-if="!item.data.genres || item.data.genres.length === 0">N/A</span>
        </template>
        <!-- Slot para acciones -->
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="mr-2" @click="openEditDialog(item)" :disabled="isEditing"> <!-- Disable edit while already editing -->
            mdi-pencil
          </v-icon>
          <v-icon size="small" @click="deleteBook(item)" :disabled="isEditing"> <!-- Disable delete while editing -->
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-container>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue'
// Firebase imports (sin cambios)
import 'firebase/firestore'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc  } from 'firebase/firestore/lite';

// Firebase config (sin cambios)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (sin cambios)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  setup() {
    // --- Estado ---
    const initialBookState = { name: '', author: '', year: '', genres: [] }; // Estado inicial para resetear
    const book = ref({ ...initialBookState }); // Form model
    const genres = ref(['Ficción', 'No ficción', 'Ciencia ficción', 'Fantasía', 'Misterio', 'Biografía', 'Terror', 'Romance']);
    const books = ref([]); // Lista de libros de Firestore
    const headers = ref([
      { title: 'Nombre', key: 'name' },
      { title: 'Autor', key: 'author' },
      { title: 'Año', key: 'year', sortable: true },
      { title: 'Género', key: 'genres', sortable: false }, // Genre sorting might be complex
      { title: 'Acciones', key: 'actions', sortable: false }
    ]);
    const isEditing = ref(false); // Flag para indicar si estamos en modo edición
    const editingBookId = ref(null); // ID del libro que se está editando

    // --- Funciones ---

    const resetFormAndState = () => {
      book.value = { ...initialBookState }; // Resetear formulario a estado inicial
      isEditing.value = false; // Salir del modo edición
      editingBookId.value = null; // Limpiar ID de edición
    };

    const validateForm = () => {
      if (!book.value.name || !book.value.author || !book.value.year) {
        alert("Por favor, completa los campos obligatorios: Nombre, Autor y Año.");
        return false; // Indica que la validación falló
      }
      return true; // Indica que la validación pasó
    }

    const addBook = async () => {
      if (!validateForm()) return; // Detener si la validación falla

      try {
        // Asegurarse de que genres sea un array, incluso si está vacío
        const bookData = {
            ...book.value,
            genres: book.value.genres || []
        };

        const docRef = await addDoc(collection(db, "books"), bookData);

        // Agregar a la lista local con el ID y la estructura correcta
        books.value.push({
          id: docRef.id,
          data: { ...bookData }, // Usar la data enviada a Firestore
        });

        resetFormAndState(); // Limpiar formulario y estado
        alert("Libro agregado correctamente.");

      } catch (e) {
        console.error("Error al agregar el documento: ", e);
        alert("Hubo un error al agregar el libro.");
      }
    };

    // Renombrado para claridad, ahora maneja la lógica de submit de la actualización
    const submitUpdate = async () => {
      if (!validateForm()) return; // Validar antes de actualizar
      if (!editingBookId.value) return; // Seguridad: asegurarse de que hay un ID

      try {
        const bookRef = doc(db, "books", editingBookId.value);
        // Asegurarse de que genres sea un array
        const updatedData = {
            ...book.value,
            genres: book.value.genres || []
        };
        await updateDoc(bookRef, updatedData);

        // Actualizar el libro en el array local 'books'
        const bookIndex = books.value.findIndex(b => b.id === editingBookId.value);
        if (bookIndex !== -1) {
          // Actualizar la propiedad 'data' del libro existente
          books.value[bookIndex].data = { ...updatedData };
        }

        alert("Libro actualizado correctamente.");
        resetFormAndState(); // Limpiar formulario y salir del modo edición

      } catch (e) {
        console.error("Error al actualizar el documento: ", e);
        alert("Hubo un error al actualizar el libro.");
        // Opcional: podrías decidir no resetear el formulario si hay un error
        // resetFormAndState();
      }
    };

    const deleteBook = async (item) => {
      // Preguntar confirmación antes de borrar
      if (!confirm(`¿Estás seguro de que quieres eliminar el libro "${item.data.name}"?`)) {
          return;
      }
      try {
          await deleteDoc(doc(db, "books", item.id));
          books.value = books.value.filter(b => b.id !== item.id); // Eliminar de la lista local
          alert("Libro eliminado correctamente.");
          // Si el libro eliminado era el que se estaba editando, cancelar edición
          if (isEditing.value && editingBookId.value === item.id) {
              resetFormAndState();
          }
      } catch (e) {
          console.error("Error al eliminar el documento: ", e);
          alert("Hubo un error al eliminar el libro.");
      }
    };

    const openEditDialog = (item) => {
      isEditing.value = true; // Activar modo edición
      editingBookId.value = item.id; // Guardar el ID del libro a editar

      // Llenar el formulario con los datos del libro seleccionado
      // Es importante crear copias para no modificar el original directamente
      book.value = {
        name: item.data.name,
        author: item.data.author,
        year: item.data.year,
        // Asegurarse de que genres sea un array, incluso si no existe en Firestore
        genres: item.data.genres ? [...item.data.genres] : []
      };
      // Scroll to top or focus first field might be helpful UX
      window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
      resetFormAndState(); // Simplemente resetea el formulario y el estado
    };

    // --- Ciclo de vida ---
    onMounted(async () => {
      try {
        const booksCol = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCol);
        const booksList = booksSnapshot.docs.map(doc => ({
          id: doc.id, // Corregido para usar 'id'
          data: doc.data()
        }));
        books.value = booksList; // Reemplazar el array inicial con los datos de Firestore
      } catch (error) {
          console.error("Error fetching books:", error);
          alert("No se pudieron cargar los libros.");
      }
    });

    // --- Retorno ---
    return {
      book,
      genres,
      books,
      headers,
      isEditing, // Exponer el estado de edición
      addBook,
      deleteBook,
      openEditDialog,
      submitUpdate, // Exponer la función para manejar el submit de la actualización
      cancelEdit    // Exponer la función para cancelar la edición
    }
  }
}
</script>

<style>
/* Puedes agregar estilos si es necesario */
.mt-4 {
    margin-top: 1.5rem; /* Añade un poco de espacio sobre la tabla */
}
.mr-2 {
    margin-right: 0.5rem; /* Espacio entre botones */
}
.ma-1 {
    margin: 0.25rem !important; /* Ajuste para chips */
}
</style>