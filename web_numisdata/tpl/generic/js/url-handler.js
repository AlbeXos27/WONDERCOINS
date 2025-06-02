function handleURLChange(elementSelector, classMappings) {
    const elements = document.querySelectorAll(elementSelector);

    function updateClasses() {
        const pathname = window.location.pathname;
        console.log(`Current pathname: ${pathname}`); // Para depuración

        elements.forEach(element => {
            // Save the original class
            const originalClass = element.dataset.originalClass || element.className;

            // Remove all classes listed in classMappings and the original class
            for (let className of Object.values(classMappings)) {
                if (element.classList.contains(className)) {
                    element.classList.remove(className);
                }
            }
            if (element.classList.contains(originalClass)) {
                element.classList.remove(originalClass);
            }

            // Add the class corresponding to the pathname if it matches
          
            for (let [key, value] of Object.entries(classMappings)) {
                if (pathname.includes(key)) {
                    element.classList.add(value);
                    classAdded = true;
                }
            }

            // If no class from classMappings was added, revert to the original class
            if (!classAdded) {
                element.classList.add(originalClass);
            }

            // Save the original class back to the dataset
            element.dataset.originalClass = originalClass;
        });
    }

    updateClasses();

    // Handle URL changes without reloading (SPA)
    window.addEventListener('popstate', updateClasses);
    window.addEventListener('pushstate', updateClasses);
    window.addEventListener('replacestate', updateClasses);
}


   