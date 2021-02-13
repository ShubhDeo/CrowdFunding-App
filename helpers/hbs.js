const moment = require("moment");


module.exports = {
    formatDate: (date, format) => {
        return moment(date).format(format);
    },
    truncate: (content) => {
        if (content.length > 100) {
            let con = content.substring(0, 100);
            con += '...';
            content = con;
        }
        return content;
    }
}