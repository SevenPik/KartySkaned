const svgContainer = document.querySelector('.passwrd-svgs')
const svgGroup = svgContainer.querySelectorAll('svg');
const passwordClsSvg = svgContainer.querySelector('.passwrd-close-svg');
const passwordOpenSvg = svgContainer.querySelector('.passwrd-open-svg');
const passwordInput = document.getElementById('usr-passwrd');
// password svg change on click
passwordClsSvg.addEventListener('click', ()=>{
	passwordClsSvg.style.display = 'none';
	passwordOpenSvg.style.display = 'block';
	passwordInput.type = 'password';
});

passwordOpenSvg.addEventListener('click', ()=>{
	passwordOpenSvg.style.display = 'none';
	passwordClsSvg.style.display = 'block';
	passwordInput.type = 'text';
});

// password toggle ripple effect in password eye svg
svgGroup.forEach(svg => {
    svg.addEventListener('click', function() {
        svgContainer.classList.add('ripple-active');
        setTimeout(() => {
            svgContainer.classList.remove('ripple-active');
        }, 500);
    });
});
