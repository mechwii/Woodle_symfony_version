/**
 * Fonction qui permet d'ouvrir et de fermer la navbar
 */
function toggleNav() {
    // On récupère l'élément de la navbar
    const nav = document.getElementById('navbar');

    const content = document.getElementById('content');
    const chevron = document.getElementById('chevron');
    const navTexts = document.querySelectorAll('.nav-text');
    const logoText = document.querySelector('.logo-text');

    if (nav.style.width === '350px' || nav.style.width !== '100px') {
        // Si elle fermé on l'ouvre et on affiche les texte
        nav.style.width = '100px';
        nav.style.alignItems = 'center';
        content.style.marginLeft = '150px';
        chevron.style.transform = 'rotate(0deg)';
        navTexts.forEach(text => text.style.display = 'none');
        logoText.style.display = 'none';
    } else {
        // Sinon on la ferme
        nav.style.alignItems = 'normal';
        nav.style.width = '350px';
        content.style.marginLeft = '400px';
        chevron.style.transform = 'rotate(180deg)';

        navTexts.forEach(text => text.style.display = 'inline');
        logoText.style.display = 'block';
    }
}