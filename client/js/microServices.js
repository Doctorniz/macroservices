document.getElementById("timeStamp").onsubmit = (form) => {
        form.preventDefault();
        //console.log(form.target.children.original.value);
        var time = form.target.children.time.value;
        window.location.href = '/time/'+time;
}


document.getElementById("toShort").onsubmit = (form) => {
        form.preventDefault();
        //console.log(form.target.children.original.value);
        var original = form.target.children.original.value;
        window.location.href = '/short/'+original;
}



document.getElementById("toLong").onsubmit = (form) => {
        form.preventDefault();
        //console.log(form.target.children)
        var short = form.target.children.short.value;
        window.location.href = '/u/'+short;
}

document.getElementById("offset").addEventListener("change", (e) => {
        const newint = e.path[0].value.toString();
        document.getElementById("offsetVal").textContent = newint;
});

document.getElementById("imageSearch").onsubmit = (form) => {
        form.preventDefault();
        //console.log(form.target.children.terms.value, form.target.children.offset.value);
        const terms = form.target.children.terms.value,
                offset = form.target.children.offset.value;
        window.location.href = '/search/'+terms+'?offset='+offset;
}


    
    
