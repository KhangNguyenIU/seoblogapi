const { trim } = require("lodash");


exports.smartTrim = (str, length, delim, appendix) => {
    if (str.length <= length)
        return str;

    var trimedStr = str.substr(0, length + delim.length);

    var lastIndexDelim = trimedStr.lastIndexOf(delim);
    if (lastIndexDelim >= 0)
        trimedStr = trimedStr.substr(0, lastIndexDelim);

    if (trimedStr)
        trimedStr += appendix;
    return trimedStr;
}