// script.js

document.querySelectorAll('.link').forEach(link => {
    link.addEventListener('click', () => {
        console.log(`Clicked on ${link.href}`);
        // You can add more functionality here, like tracking clicks or opening links in new tabs.
    });
});
