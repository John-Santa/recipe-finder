function iniciarApp () {

    const seletCategorias = document.querySelector('#categorias');
    seletCategorias.addEventListener('change', seleccionarCategoria);
    const resultado = document.querySelector('#resultado');
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
            recetaImagen.src = strMealThumb;
            recetaImagen.alt = `Imagen de la receta ${strMeal}`;

            const recetaCardBody = document.createElement('div');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal;

            const recetaBoton = document.createElement('button');
            recetaBoton.classList.add('btn', 'btn-danger', 'w-100');
            recetaBoton.textContent = 'Ver Receta';
            // recetaBoton.dataset.bsTarget = '#modal';
            // recetaBoton.dataset.bsToggle = 'modal';
            recetaBoton.onclick = () => {
                seleccionarReceta(idMeal);
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
        modal.show();
    }

    function limpiarHTML (referencia) {
        while(referencia.firstChild) {
            referencia.removeChild(referencia.firstChild);
        }
    }

    obtenerCategorias();

}






document.addEventListener('DOMContentLoaded', iniciarApp);