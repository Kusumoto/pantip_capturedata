exports.showObject = function (obj) {
  var result = "";
  for (var p in obj) {
    if( obj.hasOwnProperty(p) && obj[p] != null) {
      result += p + "=" + obj[p] + "&";
    }
  }
  return result;
}
