function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

function getFormatDate() {
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    return d.getFullYear().toString() +
           pad(d.getMonth() + 1) +
           pad(d.getDate()) +
           pad(d.getHours()) +
           pad(d.getMinutes()) +
           pad(d.getSeconds());
}

module.exports = {
    sortObject,
    getFormatDate
};
