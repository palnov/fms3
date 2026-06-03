Передача лида
Лид отправляется POST-запросом по адресу https://leads-reception.feedot.com/api/v1/partner-leads

Название параметра	Тип	Описание
edata[name] *	String	Имя автора вопроса.
edata[phone] *	String	Телефон для связи с автором вопроса, формат: "71234567890", 11 цифр, обязательно начинается с "7" — кода страны.
edata[question] *	String	Текст лида.
edata[cd-referral] *	String	Реферальный id партнера, выдается при регистрации партнера.
Ваш id: 0ff02e8ecb98e8b66ae44c2b729d0343
edata[secret] *	String	Ключ необходимо получить у менеджера службы поддержки.
edata[city_id] 	Number	Идентификатор города.
Eсли идентификатор города не передан, имеет нулевое или не валидное значение, город будет определен автоматически по телефону лида.

Идентификатор города можно получить путем получения списка городов.
edata[putm_content] 	String	Произвольная строка длиной до 200 символов, которая будет отображаться в поле "тип промо" при отображении лида в ЛК партнера.
edata[putm_medium] 	String	Произвольная строка длиной до 200 символов, которая будет отображаться в поле "источник" при отображении лида в ЛК партнера.
edata[chan] 	Number	Числовой идентификатор канала трафика, информация о котором будет отображаться в поле "Канал" при отображении лида в ЛК партнера.
edata[data1] 	String	Пользовательская метка — произвольная строка длиной до 200 символов, которая будет отображаться в поле "метка1" при отображении лида в ЛК партнера.
edata[data2] 	String	Пользовательская метка - произвольная строка длиной до 200 символов, которая будет отображаться в поле "метка2" при отображении лида в ЛК партнера.
Знаком * обозначены обязательные поля
Логика передачи лидов БФЛ
Для передачи БФЛ лида через API, необходимо передавать текст определенного формата. Наличие всех трёх строк строго обязательно.

Например:

Банкротство физических лиц, сумма долга более 300 тыс. руб.
Общая сумма вашей задолженности: 300 - 500 тыс. руб.
Оформлена ли на вас ипотека?: Нет

Пример запроса для передачи лида
В результате запроса будет создан лид с городом Санкт-Петербург (определен по номеру телефона), с текстом вопроса "test" и с именем клиента "Алексей".

Пример CURL запроса для передачи лида:

'curl -X POST --data 'edata[phone]=79119094234&edata[question]=test&edata[name]=client&edata[cd-referral]=0ff02e8ecb98e8b66ae44c2b729d0343&edata[secret]=ВАШ_СЕКРЕТНЫЙ_КЛЮЧ' https://leads-reception.feedot.com/api/v1/partner-leads'
Пример запроса на PHP:

$leadData = [
    'edata[name]' => 'Алексей',
    'edata[phone]' => '79119094234',
    'edata[question]' => 'Test',
    'edata[cd-referral]' => '0ff02e8ecb98e8b66ae44c2b729d0343',
    'edata[secret]' => 'ВАШ_СЕКРЕТНЫЙ_КЛЮЧ'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
curl_setopt($ch, CURLOPT_URL, 'https://leads-reception.feedot.com/api/v1/partner-leads');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($leadData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$resultJson = curl_exec($ch);
curl_close($ch);

$result = json_decode($resultJson, true);

if ($result['code'] == 200 && $result['edata']['result']) {
    echo 'Lead created';
} else {
    echo 'Lead wasn\'t created';
}
Ответ сервера:

{
    "code": 200,
    "edata": {
        "entityId": "5f0750446ae5f5000e7d0e64",
        "result": "success"
    }
}
Поле entityId — глобальный идентификатор, по которому можно получить данные о лиде.

Получение списка населенных пунктов
Для получения списка населенных пунктов нужно отправить GET-запрос по адресу https://api.my.feedot.com/rest/v1/cities

Название параметра	Тип	Описание
prefix 	String	Название города или часть названия города.
Если отправлен запрос без параметра, будет возвращен список самых крупных городов.
Пример запроса
Пример запроса на jQuery:

$.ajax({
    method: 'get',
    url: 'https://api.my.feedot.com/rest/v1/cities',
    data: {
        prefix: 'Москва'
    },
    success: function(data) {
        console.log(data);
    }
});
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": {
        "cities": [
            {
                "id": 16,
                "name": "Санкт-Петербург",
                "region_id": 78,
                "area_id": null,
                "label": "Город",
                "short_label": "г",
                "alias": "saint-petersburg",
                "priority": 984197,
                "region": {
                    "id": 78,
                    "name": "Санкт-Петербург",
                    "label": "Город",
                    "short_label": "г",
                    "capital_id": 16
                },
                "is_region_capital": 1,
                "area": null
            }
        ]
    }
}
Получение списка лидов
Для получения списка лидов, необходимо выполнить GET-запрос по адресу https://api.my.feedot.com/rest/v1/leads

При использовании метода необходимо посылать заголовок Authorization с токеном авторизации.

Название параметра	Тип	Описание
limit 	Number	Число строк в выборке.
Значение по умолчанию: 10.
Возможные значения: 10, 25, 50.
offset 	Number	Смещение относительно начала получаемого списка.
Значение по умолчанию: 0.
Если к любому из параметров limit, offset добавить "D", считается, что выборку нужно осуществлять в днях. Если задан offset в днях, но не задан limit: limit считается равным 1D. Если задан limit в днях, но не задан offset: offset считается равным 0D. Если один из параметров имеет постфикс "D", то второй тоже считается с "D", даже если это не указано явно.

Список формируется отсортированным по дате поступления в обратном порядке. То есть последний пришедший лид приходит первым.

Ответ сервера при получении списка лидов
Название параметра	Тип	Описание
meta 	Object	Статус HTTP-ответа.
data 	Array	Список лидов
Описание полей лида

Название параметра	Тип	Описание
id 	Number	Уникальный идентификатор лида
global_id 	Number	Глобальный идентификатор лида
lead_type 	String	Тип лида (текстовый/звонок)
date_created 	String	Время создания
city_name 	String	Город
title 	String	Тематика
track_name 	String	Название канала
subid1 	String	Тип промо
subid2 	String	Источник (номер телефона или ссылка)
label1 	String	Пользовательская метка 1
label2 	String	Пользовательская метка 2
question_text 	String	Текст вопроса
sold_price 	Number	Цена продажи лида (если продан)
phone 	String	Номер телефона (без двух последних цифр)
status 	String	Статус (продан/не продан/брак)
deffect_state 	String	Причина отбраковки (отображается, только если лид имеет статус "брак")
Пример запроса получения списка лидов
Пример CURL запроса для получения списка лидов:

curl -X GET -H 'Authorization: Bearer NULBQTA8RTAtNEIzOC0y6EI2LUU0ODAtRkY0QTU1N0E4N0Q2' https://api.my.feedot.com/rest/v1/leads
Пример запроса на PHP:

$getAuthToken = function($email, $password) {
    $requestData = [
        'email' => $email,
        'password' => $password,
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
    curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/auth');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $resultJson = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($resultJson, true);
    
    return $result['data']['token'];
};
$authToken = $getAuthToken('partner2000@gmail.com', 'm091xo8e791h87hnex');
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/leads');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $authToken,
));

$resultJson = curl_exec($ch);
curl_close($ch);

$result = json_decode($resultJson, true);
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": [
        {
            "id": "8029",
            "global_id": "5f0750446ae5f5000e7d0e64",
            "lead_type": "text",
            "date_created": "2018-05-17 17:29:13",
            "city_name": null,
            "title": "Все тематики",
            "track_name": null,
            "subid1": "form",
            "subid2": "967",
            "label1": "abc",
            "label2": "xyz",
            "question_text": "тест",
            "sold_price": null,
            "phone": "799912345XX",
            "status": "Не продана"
        },
        ...
    ]
}
Получение лида
Для получения данных лида, необходимо выполнить GET-запрос по адресу https://api.my.feedot.com/rest/v1/leads/LEAD_ID, где LEAD_ID — уникальный идентификатор лида или глобальный идентификатор лида

При использовании метода необходимо посылать заголовок Authorization с токеном авторизации.

Ответ сервера при получении лида
Название параметра	Тип	Описание
meta 	Object	Статус HTTP-ответа.
data 	Object	Данные лида
Описание полей лида

Название параметра	Тип	Описание
id 	Number	Уникальный идентификатор лида
global_id 	Number	Глобальный идентификатор лида
lead_type 	String	Тип лида (текстовый/звонок)
date_created 	String	Время создания
city_name 	String	Город
title 	String	Тематика
track_name 	String	Название канала
subid1 	String	Тип промо
subid2 	String	Источник (номер телефона или ссылка)
label1 	String	Пользовательская метка 1
label2 	String	Пользовательская метка 2
question_text 	String	Текст вопроса
sold_price 	Number	Цена продажи лида (если продан)
phone 	String	Номер телефона (без двух последних цифр)
status 	String	Статус (продан/не продан/брак)
deffect_state 	String	Причина отбраковки (отображается, только если лид имеет статус "брак")
Пример запроса получения лида
Пример CURL запроса для получения лида:

curl -X GET -H 'Authorization: Bearer NULBQTA8RTAtNEIzOC0y6EI2LUU0ODAtRkY0QTU1N0E4N0Q2' https://api.my.feedot.com/rest/v1/leads/7990
Пример запроса на PHP:

$getAuthToken = function($email, $password) {
    $requestData = [
        'email' => $email,
        'password' => $password,
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
    curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/auth');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $resultJson = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($resultJson, true);
    
    return $result['data']['token'];
};
$authToken = $getAuthToken('partner2000@gmail.com', 'm091xo8e791h87hnex');

$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/leads/7990');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $authToken,
));

$resultJson = curl_exec($ch);
curl_close($ch);

$result = json_decode($resultJson, true);
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": {
        "id": "7990",
        "global_id": "5f0750446ae5f5000e7d0e64",
        "lead_type": "text",
        "date_created": "2018-05-15 12:54:38",
        "city_name": "Омск",
        "title": "Все тематики",
        "track_name": null,
        "subid1": "form",
        "subid2": "967",
        "label1": "abc",
        "label2": "xyz",
        "question_text": "тест",
        "sold_price": null,
        "phone": "795112345XX",
        "status": "Не продана"
    }
} 
Аутентификация и авторизация
Доступ к CPA REST API выдается по запросу к администрации ресурса, с указанием e-mail аккаунта партнера.

После разрешения доступа, необходимо сделать POST-запрос на получение ключа доступа к API непосредственно для работы функционала передачи лидов по адресу https://api.my.feedot.com/rest/v1/auth, передав логин (e-mail) и пароль от аккаунта партнера на сайте my.feedot.com.

С момента прохождения авторизации для получения данных посредством функционала CPA REST API, каждый запрос должен сопровождаться заголовком Authorization: Bearer token.

Функционал CPA REST API не предоставляется при некорректном, пустом или просроченном значении параметра token.

Название параметра	Тип	Описание
email 	String	Ваш логин для личного кабинета
password 	String	Ваш пароль от личного кабинета
Ответ сервера при авторизации
Название параметра	Тип	Описание
meta 	Object	Статус HTTP-ответа.
data 	Array	Данные авторизации
Описание полей авторизации

Название параметра	Тип	Описание
token 	String	Уникальный ключ доступа к API
Пример запроса для авторизации
Пример CURL запроса для получения списка лидов:

curl -X POST --data 'email=xxx&password=yyy' https://api.my.feedot.com/rest/v1/auth
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": {
        "token": "NULBQTA8RTAtNEIzOC0y6EI2LUU0ODAtRkY0QTU1N0E4N0Q2" 
    }
}




Получение списка населенных пунктов
Для получения списка населенных пунктов нужно отправить GET-запрос по адресу https://api.my.feedot.com/rest/v1/cities

Название параметра	Тип	Описание
prefix 	String	Название города или часть названия города.
Если отправлен запрос без параметра, будет возвращен список самых крупных городов.
Пример запроса
Пример запроса на jQuery:

$.ajax({
    method: 'get',
    url: 'https://api.my.feedot.com/rest/v1/cities',
    data: {
        prefix: 'Москва'
    },
    success: function(data) {
        console.log(data);
    }
});
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": {
        "cities": [
            {
                "id": 16,
                "name": "Санкт-Петербург",
                "region_id": 78,
                "area_id": null,
                "label": "Город",
                "short_label": "г",
                "alias": "saint-petersburg",
                "priority": 984197,
                "region": {
                    "id": 78,
                    "name": "Санкт-Петербург",
                    "label": "Город",
                    "short_label": "г",
                    "capital_id": 16
                },
                "is_region_capital": 1,
                "area": null
            }
        ]
    }
}
Получение списка лидов
Для получения списка лидов, необходимо выполнить GET-запрос по адресу https://api.my.feedot.com/rest/v1/leads

При использовании метода необходимо посылать заголовок Authorization с токеном авторизации.

Название параметра	Тип	Описание
limit 	Number	Число строк в выборке.
Значение по умолчанию: 10.
Возможные значения: 10, 25, 50.
offset 	Number	Смещение относительно начала получаемого списка.
Значение по умолчанию: 0.
Если к любому из параметров limit, offset добавить "D", считается, что выборку нужно осуществлять в днях. Если задан offset в днях, но не задан limit: limit считается равным 1D. Если задан limit в днях, но не задан offset: offset считается равным 0D. Если один из параметров имеет постфикс "D", то второй тоже считается с "D", даже если это не указано явно.

Список формируется отсортированным по дате поступления в обратном порядке. То есть последний пришедший лид приходит первым.

Ответ сервера при получении списка лидов
Название параметра	Тип	Описание
meta 	Object	Статус HTTP-ответа.
data 	Array	Список лидов
Описание полей лида

Название параметра	Тип	Описание
id 	Number	Уникальный идентификатор лида
global_id 	Number	Глобальный идентификатор лида
lead_type 	String	Тип лида (текстовый/звонок)
date_created 	String	Время создания
city_name 	String	Город
title 	String	Тематика
track_name 	String	Название канала
subid1 	String	Тип промо
subid2 	String	Источник (номер телефона или ссылка)
label1 	String	Пользовательская метка 1
label2 	String	Пользовательская метка 2
question_text 	String	Текст вопроса
sold_price 	Number	Цена продажи лида (если продан)
phone 	String	Номер телефона (без двух последних цифр)
status 	String	Статус (продан/не продан/брак)
deffect_state 	String	Причина отбраковки (отображается, только если лид имеет статус "брак")
Пример запроса получения списка лидов
Пример CURL запроса для получения списка лидов:

curl -X GET -H 'Authorization: Bearer NULBQTA8RTAtNEIzOC0y6EI2LUU0ODAtRkY0QTU1N0E4N0Q2' https://api.my.feedot.com/rest/v1/leads
Пример запроса на PHP:

$getAuthToken = function($email, $password) {
    $requestData = [
        'email' => $email,
        'password' => $password,
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
    curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/auth');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $resultJson = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($resultJson, true);
    
    return $result['data']['token'];
};
$authToken = $getAuthToken('partner2000@gmail.com', 'm091xo8e791h87hnex');
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/leads');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $authToken,
));

$resultJson = curl_exec($ch);
curl_close($ch);

$result = json_decode($resultJson, true);
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": [
        {
            "id": "8029",
            "global_id": "5f0750446ae5f5000e7d0e64",
            "lead_type": "text",
            "date_created": "2018-05-17 17:29:13",
            "city_name": null,
            "title": "Все тематики",
            "track_name": null,
            "subid1": "form",
            "subid2": "967",
            "label1": "abc",
            "label2": "xyz",
            "question_text": "тест",
            "sold_price": null,
            "phone": "799912345XX",
            "status": "Не продана"
        },
        ...
    ]
}
Получение лида
Для получения данных лида, необходимо выполнить GET-запрос по адресу https://api.my.feedot.com/rest/v1/leads/LEAD_ID, где LEAD_ID — уникальный идентификатор лида или глобальный идентификатор лида

При использовании метода необходимо посылать заголовок Authorization с токеном авторизации.

Ответ сервера при получении лида
Название параметра	Тип	Описание
meta 	Object	Статус HTTP-ответа.
data 	Object	Данные лида
Описание полей лида

Название параметра	Тип	Описание
id 	Number	Уникальный идентификатор лида
global_id 	Number	Глобальный идентификатор лида
lead_type 	String	Тип лида (текстовый/звонок)
date_created 	String	Время создания
city_name 	String	Город
title 	String	Тематика
track_name 	String	Название канала
subid1 	String	Тип промо
subid2 	String	Источник (номер телефона или ссылка)
label1 	String	Пользовательская метка 1
label2 	String	Пользовательская метка 2
question_text 	String	Текст вопроса
sold_price 	Number	Цена продажи лида (если продан)
phone 	String	Номер телефона (без двух последних цифр)
status 	String	Статус (продан/не продан/брак)
deffect_state 	String	Причина отбраковки (отображается, только если лид имеет статус "брак")
Пример запроса получения лида
Пример CURL запроса для получения лида:

curl -X GET -H 'Authorization: Bearer NULBQTA8RTAtNEIzOC0y6EI2LUU0ODAtRkY0QTU1N0E4N0Q2' https://api.my.feedot.com/rest/v1/leads/7990
Пример запроса на PHP:

$getAuthToken = function($email, $password) {
    $requestData = [
        'email' => $email,
        'password' => $password,
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
    curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/auth');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $resultJson = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($resultJson, true);
    
    return $result['data']['token'];
};
$authToken = $getAuthToken('partner2000@gmail.com', 'm091xo8e791h87hnex');

$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, 'Feedot API Client');
curl_setopt($ch, CURLOPT_URL, 'https://api.my.feedot.com/rest/v1/leads/7990');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $authToken,
));

$resultJson = curl_exec($ch);
curl_close($ch);

$result = json_decode($resultJson, true);
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": {
        "id": "7990",
        "global_id": "5f0750446ae5f5000e7d0e64",
        "lead_type": "text",
        "date_created": "2018-05-15 12:54:38",
        "city_name": "Омск",
        "title": "Все тематики",
        "track_name": null,
        "subid1": "form",
        "subid2": "967",
        "label1": "abc",
        "label2": "xyz",
        "question_text": "тест",
        "sold_price": null,
        "phone": "795112345XX",
        "status": "Не продана"
    }
} 
Аутентификация и авторизация
Доступ к CPA REST API выдается по запросу к администрации ресурса, с указанием e-mail аккаунта партнера.

После разрешения доступа, необходимо сделать POST-запрос на получение ключа доступа к API непосредственно для работы функционала передачи лидов по адресу https://api.my.feedot.com/rest/v1/auth, передав логин (e-mail) и пароль от аккаунта партнера на сайте my.feedot.com.

С момента прохождения авторизации для получения данных посредством функционала CPA REST API, каждый запрос должен сопровождаться заголовком Authorization: Bearer token.

Функционал CPA REST API не предоставляется при некорректном, пустом или просроченном значении параметра token.

Название параметра	Тип	Описание
email 	String	Ваш логин для личного кабинета
password 	String	Ваш пароль от личного кабинета
Ответ сервера при авторизации
Название параметра	Тип	Описание
meta 	Object	Статус HTTP-ответа.
data 	Array	Данные авторизации
Описание полей авторизации

Название параметра	Тип	Описание
token 	String	Уникальный ключ доступа к API
Пример запроса для авторизации
Пример CURL запроса для получения списка лидов:

curl -X POST --data 'email=xxx&password=yyy' https://api.my.feedot.com/rest/v1/auth
Ответ сервера:

{
    "meta": {
        "code": 200,
        "message": "OK"
    },
    "data": {
        "token": "NULBQTA8RTAtNEIzOC0y6EI2LUU0ODAtRkY0QTU1N0E4N0Q2" 
    }
}