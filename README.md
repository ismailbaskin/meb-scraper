# meb-scraper
Can sıkıntısından yazdığım [MEB kurumlar listesini](https://mebbis.meb.gov.tr/kurumlistesi.aspx) çekmeye yarayan [CasperJS](http://casperjs.org/) skripti.

```bash
$ casperjs meb.js
```

Siz çekeceğim diye uğraşmayın boşuna, çıktılar 2 json dosyasında var zaten. [Jq](https://stedolan.github.io/jq/) ile bu dosyaları istediğiniz gibi düzenleyebilirsiniz.

### Örnekler

Resmi kurumların 1.sini gösterelim
```bash
$ curl https://raw.githubusercontent.com/ismailbaskin/meb-scraper/master/resmi_kurumlar.json.gz | gunzip -c | jq '.[0]'
```
çıktısı
```json
[
  {
    "Adres": "AKÖREN MAH. CUMHURİYET CADDE NO:35 PK:01710 ALADAĞ/ADANA",
    "Adres Kodu": "1197403973",
    "Fax": "",
    "Kurum Adı": "AKÖREN ÇOK PROGRAMLI ANADOLU LİSESİ",
    "Telefon": "(322) 594 20 07",
    "İl Adı": "ADANA",
    "İlçe Adı": "ALADAĞ"
  }
]
```

Kaç resmi kurum var?
```bash
$ curl https://raw.githubusercontent.com/ismailbaskin/meb-scraper/master/resmi_kurumlar.json.gz | gunzip -c | jq '. | length'
```

kurum, il şeklinde yeniden formatlama
```bash
$ curl https://raw.githubusercontent.com/ismailbaskin/meb-scraper/master/resmi_kurumlar.json.gz | gunzip -c | jq '.[] | {kurum: ."Kurum Adı", il: ."İl Adı"}'
```
