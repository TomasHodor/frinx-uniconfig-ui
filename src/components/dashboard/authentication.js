import csvFilePath from '../../data/users.csv';
import Papa from "papaparse/papaparse.min";
import passwordHash from "password-hash";
import {toCSV} from "react-csv/src/core";

export function getLoginData() {
    try {
        if (csvFilePath) {
            return new Promise(function (resolve, reject) {
                Papa.parse(csvFilePath, {
                    header: true,
                    download: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        resolve({result: results.data})
                    }
                });
            });
        }
    } catch (err) {
        console.log(err);
    }
}

export function authenticate(username, password) {
    return getLoginData().then(result => {
            let user = {};
            result.result.forEach(item => {
                if (username === item.name || username === item.email)
                    if (passwordHash.verify(password, item.password)) {
                        user = {
                            "username":item.name,
                            "useremail":item.email
                        };
                    }
            });
            return user;
        },
        () => {
            return {};
        });

}

export function registration(username, email, password) {
    return getLoginData().then(data => {
        let object = {
            name: username,
            email: email,
            password: passwordHash.generate(password)
        };

        data.result.push(object);

        let headers = [
            {label: "name", key: "name"},
            {label: "email", key: "email"},
            {label: "password", key: "password"}
        ];

        let blob = new Blob([toCSV(data.result, headers, ",", "")]);

        let a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {type: "text/csv"});
        a.download = "users.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}