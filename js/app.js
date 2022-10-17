function iniciarApp () {

    const seletCategorias = document.querySelector('#categorias');

    const obtenerCategorias = () => {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then( respuesta => respuesta.json() )
            .then( resultado => mostrarCategorias(resultado.categories) );
    }

    const mostrarCategorias = categorias => {
        categorias.forEach( categoria => {
            const { strCategory } = categoria;

            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;

            seletCategorias.appendChild(option);
        });
    }

    obtenerCategorias();
}






document.addEventListener('DOMContentLoaded', iniciarApp);