function iniciarApp () {

    const resultado = document.querySelector('#resultado');
    const seletCategorias = document.querySelector('#categorias');
    if (seletCategorias) {
        seletCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector('.favoritos');
    if (favoritosDiv) {
        obtenerFavoritos();
    }

    const modal = new bootstrap.Modal('#modal', {});

    function obtenerCategorias () {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then( respuesta => respuesta.json() )
            .then( resultado => mostrarCategorias(resultado.categories) );
    }

    function seleccionarCategoria (event) {
        const categoria = event.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        fetch(url)
            .then( respuesta => respuesta.json() )
            .then( resultado => mostrarRecetas(resultado.meals) );
    }

    function mostrarCategorias (categorias)  {
        categorias.forEach( categoria => {
            const { strCategory } = categoria;

            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;

            seletCategorias.appendChild(option);
        });
    }

    function mostrarRecetas (recetas = []) {

        limpiarHTML(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Recetas' : 'No hay recetas para mostrar';
        resultado.appendChild(heading);
        // Iterar resultados
        recetas.forEach( receta => {
            const { idMeal, strMeal, strMealThumb } = receta;
            const recetaContenedor = document.createElement('div');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('div');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('img');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.src = strMealThumb ?? receta.img;
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;

            const recetaCardBody = document.createElement('div');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaBoton = document.createElement('button');
            recetaBoton.classList.add('btn', 'btn-danger', 'w-100');
            recetaBoton.textContent = 'Ver Receta';
            // recetaBoton.dataset.bsTarget = '#modal';
            // recetaBoton.dataset.bsToggle = 'modal';
            recetaBoton.onclick = () => {
                seleccionarReceta(idMeal ?? receta.id);
            }


            //Inyectar en el HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaBoton);
            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);
            recetaContenedor.appendChild(recetaCard);
            resultado.appendChild(recetaContenedor);

        });
    }

    function seleccionarReceta (id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then( respuesta => respuesta.json() )
            .then( resultado => mostrarRecetaModal(resultado.meals[0]) );
    }

    function mostrarRecetaModal (receta) {
        const { idMeal, strMeal, strInstructions, strMealThumb } = receta;

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        const modalFooter = document.querySelector('.modal .modal-footer');
        limpiarHTML(modalFooter);

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img src="${strMealThumb}" alt="receta ${strMeal}" class="img-fluid">
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades</h3>
        `;
        //mostrar cantidades e ingredientes
        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group');
        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.textContent = `${ingrediente} - ${cantidad}`;

                listGroup.appendChild(li);
            }
        }
        modalBody.appendChild(listGroup);

        const btnFavorito = document.createElement('button');
        btnFavorito.classList.add('btn', 'btn-danger', 'w-100');
        btnFavorito.textContent = existeEnStorage(idMeal) ? 'Eliminar de favoritos' : 'Guardar Favorito';
        btnFavorito.onclick = () => {
            if (existeEnStorage(idMeal)) {
                eliminarFavorito(idMeal);
                mostrarToast('Receta eliminada de favoritos');
                btnFavorito.textContent = 'Guardar Favorito';
                return;
            }
            //localStorage.setItem('id', idMeal);
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            mostrarToast('Receta agregada a favoritos');
            btnFavorito.textContent = 'Eliminar de favoritos';
        }

        const btnCerrar = document.createElement('button');
        btnCerrar.classList.add('btn', 'btn-secondary', 'w-100');
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = () => {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrar);

        modal.show();
    }

    function agregarFavorito (receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const favoritosFiltrados = favoritos.filter( favorito => favorito.id !== id );
        localStorage.setItem('favoritos', JSON.stringify(favoritosFiltrados));
    }

    function mostrarToast (mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);

        toastBody.textContent = mensaje;
        toast.show();
    }

    function existeEnStorage (id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some( favorito => favorito.id === id );
    }


    function obtenerFavoritos () {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if (favoritos.length) {
            mostrarRecetas(favoritos);
            return;
        }

        const noFavoritos = document.createElement('p');
        noFavoritos.classList.add('text-center', 'mt-5', 'fs-4', 'font-bold');
        noFavoritos.textContent = 'No hay favoritos, agrega algunos';
        favoritosDiv.appendChild(noFavoritos);

    }


    function limpiarHTML (referencia) {
        while(referencia.firstChild) {
            referencia.removeChild(referencia.firstChild);
        }
    }


}






document.addEventListener('DOMContentLoaded', iniciarApp);