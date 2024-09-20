const navActive = document.querySelectorAll('nav .nav-link'),
          menuOpen = document.querySelector('#menu_open'),
          menuList = document.querySelector('.nav-menu');

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('window-scroll', window.scrollY > 0)
})

menuOpen.addEventListener('click', () => {
  menuList.classList.toggle('open')
})


navActive.forEach(links => {
  links.addEventListener('click', () => {
    links.classList.contains('active') ? links.classList.remove('active') : previous(); links.classList.add('active')
  console.log('done')
  })
})

function previous() {
  const check = document.querySelector('.active')
  if (check) {
    check.classList.remove('active')
  }
}