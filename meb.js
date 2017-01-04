var casper = require('casper').create({
        pageSettings: {
            loadImages: false
        },
        onResourceRequested: function (C, requestData, request) {
            if (requestData.headers[0].value.indexOf('text/css') !== -1 ||
                requestData.headers[0].value.indexOf('image/png') !== -1) {
                request.abort();
            }
        },
        waitTimeout: 60000
    }),
    fs = require('fs');

var meb = {
    kinds: [
        {
            param: "1",
            file: "resmi_kurumlar.json"
        },
        {
            param: "2",
            file: "ozel_kurumlar.json"
        }
    ],
    lastDistrictHtml: null,
    lastTableHtml: null,
    resultObj: [],
    provinces: []
};


casper.on('initialized', function (kind) {
    meb.resultObj = [];
    meb.provinces = casper.evaluate(function () {
        var opts = document.querySelector("select[name=ddlil]").options,
            provinces = [];
        [].forEach.call(opts, function (opt) {
            if (opt.value == '999') {
                return;
            }
            provinces.push(opt.value);
        });
        return provinces;
    });
    casper.emit('selected', kind);
});
casper.on('selected', function (kind) {
    casper.waitFor(function check() {
        return meb.lastDistrictHtml !== this.evaluate(function () {
                return document.querySelector("select[name=ddlilce]").innerHTML;
            });
    }, function then() {
        meb.lastDistrictHtml = this.evaluate(function () {
            return document.querySelector("select[name=ddlilce]").innerHTML;
        });
        casper.fill('form#Form1', {
            'ddlKurumTuru': meb.kinds[kind].param,
            'ddlilce': '0'
        });
        casper.click('.submitbutton');
        casper.emit('listed', kind);
    });
});
casper.on('listed', function (kind) {
    casper.waitFor(function check() {
        return meb.lastTableHtml !== casper.evaluate(function () {
                return document.querySelector("table.frmlist").innerHTML;
            });
    }, function then() {
        meb.lastTableHtml = casper.evaluate(function () {
            return document.querySelector("table.frmlist").innerHTML;
        });
        var result = this.evaluate(function () {
            var jsonObj = [], keys = [], row, trs, tds, value;
            trs = document.querySelectorAll("table.frmlist>tbody>tr");
            [].forEach.call(trs, function (tr, trIndex) {
                tds = tr.querySelectorAll('td');
                row = {};
                [].forEach.call(tds, function (td, tdIndex) {
                    value = td.innerHTML.trim();
                    if (trIndex === 0) {
                        keys.push(value);
                    }
                    else {
                        row[keys[tdIndex]] = (value === '&nbsp;') ? null : value;
                    }
                });
                if (trIndex !== 0) {
                    jsonObj.push(row);
                }
            });
            return jsonObj;
        });
        meb.resultObj = meb.resultObj.concat(result);
        console.log(meb.provinces.shift() + ' ilindeki ' + result.length + ' kurum cekildi. Kalan il :' + meb.provinces.length + '/81');
        this.emit('fetched', kind);
    });
});
casper.on('fetched', function (kind) {
    if (meb.provinces.length < 1) {
        this.emit('exported', kind);
        return;
    }
    this.fill('form#Form1', {
        'ddlil': meb.provinces[0]
    });
    this.emit('selected', kind);
});
casper.on('exported', function (kind) {
    targetFile = fs.absolute(meb.kinds[kind].file);
    targetFile = casper.filter('page.target_filename', targetFile) || targetFile;
    try {
        fs.write(targetFile, JSON.stringify(meb.resultObj), 'w');
        console.log(meb.kinds[kind].file + ' dosyasina ' + meb.resultObj.length + " kurum kaydedildi.")
    } catch (err) {
        console.log(meb.kinds[kind].file + 'olusturulamadi.');
    }
    if (kind === 0) {
        this.emit('initialized', 1);
    }
});

casper.start('https://mebbis.meb.gov.tr/kurumlistesi.aspx', function () {
    this.emit('initialized', 0);
});
casper.run();

