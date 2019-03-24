export default function(url) {
  return new Promise(function(resolve, reject) {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        resolve(this);
      }
    };

    xhttp.onerror = function() {
      reject(this);
    };

    xhttp.open("GET", url, true);
    xhttp.send();
  });
}
