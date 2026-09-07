# Сервис деск

Необходимо сделать смарт процесс сервис-деск. Сейчас у нас есть множество
направлений в канбане - IT поддержка, Поддержка SAP, Windchill, Телефония,
Электронная почта, Система видионаблюдения, Закупка IT Обородования или ПО,
Система 1С У каждого направления свой канбан, это очень неудобно как
руководлителю отслеживать все задачи если они находяться в разных местах. Также
в каждом канбане надо включать отдельно процесс согласования комплектующих или
материалов т.к. по ходу дела может это всплвть и надо включить в этот процесс
отдел закупок и Директора.

В общем мной было принято решения сделать один главный смарт процесс которыцй
покрывал все наши решения.

Примерные стадии

  - Откланено/на доработку (на любой стадии возврощаеться поставнощику
    обязательно написать причину)
  - Черновик (постановщик задач ставит задачу - она видна только у него)
  - На соглосовании с руководителем (если задача требует предварительно
    соглосования с ним)
  - Бэклог или ознакомления (мне будут поступать эти задачи чтобы я потом их
    распределил по исполнителям)
  - В ожидании работы (предварительно) - исполнители получили задачу, они
    предварительно оцценивают работу и сроки, включает необходимый материал или
    оборудования или ПО.
  - Согласования комплектующих или ПО (у директора)
  - Согласвоания цен по комплектуюшим или ПО (закупка)
  - Окончательная соглосования цены (у директора)
  - В ожидании работы (исполнитель)
  - В работе (исполнитель)
  - Завершено
  - В ожидании
  - На удаление (мне как руководителю - также надо указать причину почему)

Роли

  - Черновик - все ставят задачу видно их руководителеям (если это возможно)
  - На соглосвнаии с руководителем (сам руководитель)
  - Беклог (Я руководитель ИТ направления)
  - В ожидании работы (предварительно) - исполнитель
  - Согласования комплектующих или ПО
  - Согласвоания цен по комплектуюшим или ПО - закупщик
  - В ожидании работы (исполнитель)
  - В работе (исполнитель)
  - Завершено (исполнитель)
  - В ожидании (исполнитель)
  - На удаление (руководитель ИТ)

_Какие пояля я думаю

Черновик

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет)
  - Предыдущая стадия (скрыток поля только для адимна) - чтобы мы могли на любой
    стадии вернуть назад по каким то причинам
  - Причины возврата (пока скрыто)
  - Список чек лист со всеми товарами или ПО что нужно заказать*

*Это будит формироваться на стадии - В ожидании работы (предварительно) или
сразу в черновике если выбранно напрвления Закупка IT Обородования или ПО Не
хнаю какие возможности есть в смарт процессе но хотелось быи тиоп как чеклист
или список который состоял из Наименования,количество,цены,ссылки на ресурс (где
хотят заказать товар или ПО или хотят заказать)

На соглосовании с руководителем

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет) - если отметка да/ если
    отметка нет то задача возрощаеться назад на стадию откуда она пришла
  - Причины возврата
  - Список чек лист со всеми товарами или ПО что нужно заказать*

Бэклог или ознакомления

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет)
  - Предыдущая стадия (скрыток поля только для адимна) - чтобы мы могли на любой
    стадии вернуть назад по каким то причинам
  - Причины возврата
  - Список чек лист со всеми товарами или ПО что нужно заказать*

В ожидании работы (предварительно)

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет)
  - Предыдущая стадия (скрыток поля только для адимна) - чтобы мы могли на любой
    стадии вернуть назад по каким то причинам
  - Причины возврата
  - Список чек лист со всеми товарами или ПО что нужно заказать* - тут уже
    полноценно формирцеться если налдо заявка

Согласования комплектующих или ПО (у директора)

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет)
  - Предыдущая стадия (скрыток поля только для адимна) - чтобы мы могли на любой
    стадии вернуть назад по каким то причинам
  - Причины возврата
  - Список чек лист со всеми товарами или ПО что нужно заказать* - первичное
    соглосования

Согласвоания цен по комплектуюшим или ПО (закупка)

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет)
  - Предыдущая стадия (скрыток поля только для адимна) - чтобы мы могли на любой
    стадии вернуть назад по каким то причинам
  - Причины возврата
  - Список чек лист со всеми товарами или ПО что нужно заказать* - подбиваються
    и коректируеться цены и так далее

Окончательная соглосования цены (у директора)

  - Тип направления
  - Название задачи
  - Описание задачи
  - Крайний срок задачи
  - Приоритет (высокий средний низкий )
  - Требуеться соглосования руководителя (Да/нет)
  - Предыдущая стадия (скрыток поля только для адимна) - чтобы мы могли на любой
    стадии вернуть назад по каким то причинам
  - Причины возврата
  - Список чек лист со всеми товарами или ПО что нужно заказать* - окончатлеьное
    соглосвания

Все остальнык кратко тут все понятно

  - В ожидании работы (исполнитель)
  - В работе (исполнитель)
  - Завершено (исполнитель)
  - В ожидании (исполнитель)
  - На удаление (мне как руководителю - также надо указать причину почему) -
    поля можно добавить причинц удаления (как список причин базовых)

Идея также появилось такая что на любой стадии можно вернуть назад указав
причину возврата в без коменатрия по возврату перенести назад не полуиться

Также нужно чтобы сопровождалось все уведомлением а лучше вообще сообщениями в
чат чтобы точно не пропустил никто. Типо на вашей стадии задача ССылка на нее.

Я узе забыл что можно прикрпеплять доукменты также поля добавить

В общем это я так базовво накинул что я хочу ты можем все скоректировать
посаветовать как будит лучше сделать помеянть названия чего либо для более
лучшего понимания и так далее. Надеюсь на тебя!!!

А также для справки у меня права админа есть так что могу и бизнес процессы если
нужны сделать или обойдемся роботами главное реализовать весь функционал

Это все реазливаоть в Битрикс24 в самрт процеесе


## Мануал по получении информации в смарт процессе

### 0. Получить все смарт процессы

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.type.list
```

```json
{
        "id": 12,
        "title": "Платежные заявки",
        "code": "",
        "createdBy": 196,
        "entityTypeId": 1048,
        "customSectionId": 6,
        "isCategoriesEnabled": "Y",
        "isStagesEnabled": "Y",
        "isBeginCloseDatesEnabled": "Y",
        "isClientEnabled": "N",
        "isUseInUserfieldEnabled": "Y",
        "isLinkWithProductsEnabled": "N",
        "isMycompanyEnabled": "N",
        "isDocumentsEnabled": "N",
        "isSourceEnabled": "N",
        "isObserversEnabled": "N",
        "isRecurringEnabled": "N",
        "isRecyclebinEnabled": "N",
        "isAutomationEnabled": "Y",
        "isBizProcEnabled": "Y",
        "isSetOpenPermissions": "N",
        "isPaymentsEnabled": "N",
        "isCountersEnabled": "N",
        "createdTime": "2026-08-04T16:46:33+03:00",
        "updatedTime": "2026-08-11T14:24:19+03:00",
        "updatedBy": 196,
        "isInitialized": "Y",
        "daysBeforeClose": 7
      }
```

### 1. Настройки самого смарт-процесса

Выгружает основные настройки: включены ли воронки, стадии, роботы, корзина, печать документов и прочее.
*   **Метод:** `crm.type.getByEntityTypeId` (если вы знаете именно `entityTypeId`, например 128) или `crm.type.get` (если вы знаете порядковый ID типа, например 1)
*   **Тело запроса (JSON):**
```json
{
  "entityTypeId": 128
}
```

### 2. Все поля смарт-процесса
Выгружает список и настройки всех системных и пользовательских полей, которые есть в этом смарт-процессе.
*   **Метод:** `crm.item.fields`
*   **Тело запроса (JSON):**
```json
{
  "entityTypeId": 128
}
```

### 3. Внешний вид (настройки) карточки
Позволяет получить конфигурацию того, как поля расположены по секциям (разделам) внутри самой карточки CRM.
*   **Метод:** `crm.item.details.configuration.get`
*   **Тело запроса (JSON):**
```json
{
  "entityTypeId": 128
}
```
*(Примечание: Если у вас несколько воронок и для каждой своя карточка, нужно добавить параметр `extras: {"categoryId": <ID_воронки>}`)*

### 4. Воронки (Направления)
Если в смарт-процессе включены воронки, этот метод выгрузит их список.
*   **Метод:** `crm.category.list`
*   **Тело запроса (JSON):**
```json
{
  "entityTypeId": 128
}
```

### 5. Стадии (Этапы)
Выгружает канбан-стадии смарт-процесса.
*   **Метод:** `crm.status.list`
*   **Тело запроса (JSON):**
```json
{
  "filter": {
    "ENTITY_ID": "DYNAMIC_128_STAGE_0"
  }
}
```

*(Важно: Если смарт-процесс использует воронки, вместо `0` на конце нужно указать ID воронки из предыдущего запроса. Например, `DYNAMIC_128_STAGE_14`)*

### 6. Бизнес-процессы и Роботы

Бизнес-процессы и роботы в Битрикс24 — это, технически, одни и те же шаблоны (у роботов есть системные флаги или настройки автоматического запуска при смене стадии). Этот запрос выгрузит их все, включая их «внутрянку» — схему блоков, переменные и константы.
*   **Метод:** `bizproc.workflow.template.list`
*   **Тело запроса (JSON):**
```json
{
  "select": [
    "ID", "NAME", "DESCRIPTION", "AUTO_EXECUTE", 
    "TEMPLATE", "PARAMETERS", "VARIABLES", "CONSTANTS", "SYSTEM_CODE"
  ],
  "filter": {
    "DOCUMENT_TYPE": [
      "crm", 
      "Bitrix\\Crm\\Integration\\BizProc\\Document\\Dynamic", 
      "DYNAMIC_128"
    ]
  }
}
```
*Ключ `"TEMPLATE"` в ответе будет содержать массив/JSON со всеми кубиками-действиями БП.*

## Информация смарт процесса

### 0. Получить все смарт процессы

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.type.list
```

```json
{
        "id": 18,
        "title": "Сервис-деск",
        "code": "",
        "createdBy": 196,
        "entityTypeId": 1062,
        "customSectionId": null,
        "isCategoriesEnabled": "Y",
        "isStagesEnabled": "Y",
        "isBeginCloseDatesEnabled": "Y",
        "isClientEnabled": "Y",
        "isUseInUserfieldEnabled": "Y",
        "isLinkWithProductsEnabled": "N",
        "isMycompanyEnabled": "Y",
        "isDocumentsEnabled": "N",
        "isSourceEnabled": "Y",
        "isObserversEnabled": "Y",
        "isRecurringEnabled": "Y",
        "isRecyclebinEnabled": "N",
        "isAutomationEnabled": "Y",
        "isBizProcEnabled": "Y",
        "isSetOpenPermissions": "N",
        "isPaymentsEnabled": "N",
        "isCountersEnabled": "N",
        "createdTime": "2026-09-04T09:13:51+03:00",
        "updatedTime": "2026-09-04T09:37:06+03:00",
        "updatedBy": 196,
        "isInitialized": "Y",
        "daysBeforeClose": 180
      }
```

### 1. Настройки самого смарт-процесса

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.type.getByEntityTypeId
```

```json

{
  "entityTypeId": 1062
}

{
  "result": {
    "type": {
      "id": 18,
      "title": "Сервис-деск",
      "code": "",
      "createdBy": 196,
      "entityTypeId": 1062,
      "customSectionId": null,
      "isCategoriesEnabled": "Y",
      "isStagesEnabled": "Y",
      "isBeginCloseDatesEnabled": "Y",
      "isClientEnabled": "Y",
      "isUseInUserfieldEnabled": "Y",
      "isLinkWithProductsEnabled": "N",
      "isMycompanyEnabled": "Y",
      "isDocumentsEnabled": "N",
      "isSourceEnabled": "Y",
      "isObserversEnabled": "Y",
      "isRecurringEnabled": "Y",
      "isRecyclebinEnabled": "N",
      "isAutomationEnabled": "Y",
      "isBizProcEnabled": "Y",
      "isSetOpenPermissions": "N",
      "isPaymentsEnabled": "N",
      "isCountersEnabled": "N",
      "createdTime": "2026-09-04T09:13:51+03:00",
      "updatedTime": "2026-09-04T09:37:06+03:00",
      "updatedBy": 196,
      "isInitialized": "Y",
      "daysBeforeClose": 180,
      "relations": {
        "parent": [
          {
            "entityTypeId": 3,
            "isChildrenListEnabled": "Y",
            "isPredefined": "Y"
          },
          {
            "entityTypeId": 4,
            "isChildrenListEnabled": "Y",
            "isPredefined": "Y"
          }
        ],
        "child": [
          {
            "entityTypeId": 39,
            "isChildrenListEnabled": "Y",
            "isPredefined": "Y"
          }
        ]
      },
      "linkedUserFields": {
        "CALENDAR_EVENT|UF_CRM_CAL_EVENT": "Y",
        "TASKS_TASK|UF_CRM_TASK": "Y",
        "TASKS_TASK_TEMPLATE|UF_CRM_TASK": "Y"
      },
      "customSections": [
        {
          "id": 2,
          "title": "Бухгалтерия",
          "isSelected": "N"
        },
        {
          "id": 4,
          "title": "Бухгалтерия",
          "isSelected": "N"
        },
        {
          "id": 6,
          "title": "Платежные заявки",
          "isSelected": "N"
        }
      ]
    }
  },
  "time": {
    "start": 1788780151,
    "finish": 1788780151.609921,
    "duration": 0.6099209785461426,
    "processing": 0,
    "date_start": "2026-09-07T14:22:31+03:00",
    "date_finish": "2026-09-07T14:22:31+03:00",
    "operating_reset_at": 1788780751,
    "operating": 0
  }
}
```

### 2. Все поля смарт-процесса

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.item.fields
```
```json
{
  "entityTypeId": 1062
}

{
  "result": {
    "fields": {
      "id": {
        "type": "integer",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "ID",
        "upperName": "ID"
      },
      "title": {
        "type": "string",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Название",
        "upperName": "TITLE"
      },
      "xmlId": {
        "type": "string",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Внешний код",
        "upperName": "XML_ID"
      },
      "createdTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Когда создан",
        "upperName": "CREATED_TIME"
      },
      "updatedTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Когда обновлён",
        "upperName": "UPDATED_TIME"
      },
      "createdBy": {
        "type": "user",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Кем создан",
        "upperName": "CREATED_BY"
      },
      "updatedBy": {
        "type": "user",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Кем обновлён",
        "upperName": "UPDATED_BY"
      },
      "assignedById": {
        "type": "user",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Ответственный",
        "upperName": "ASSIGNED_BY_ID"
      },
      "opened": {
        "type": "boolean",
        "isRequired": true,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Доступно для всех",
        "upperName": "OPENED"
      },
      "webformId": {
        "type": "crm_webform",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Создано CRM-формой",
        "upperName": "WEBFORM_ID"
      },
      "lastCommunicationTime": {
        "type": "string",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата последней коммуникации",
        "upperName": "LAST_COMMUNICATION_TIME"
      },
      "begindate": {
        "type": "date",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата начала",
        "upperName": "BEGINDATE"
      },
      "closedate": {
        "type": "date",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата завершения",
        "upperName": "CLOSEDATE"
      },
      "companyId": {
        "type": "crm_company",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Компания",
        "settings": {
          "parentEntityTypeId": 4
        },
        "upperName": "COMPANY_ID"
      },
      "contactId": {
        "type": "crm_contact",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "isDeprecated": true,
        "title": "Контакт",
        "upperName": "CONTACT_ID"
      },
      "contactIds": {
        "type": "crm_contact",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": true,
        "isDynamic": false,
        "title": "Контакты",
        "upperName": "CONTACT_IDS"
      },
      "contacts": {
        "type": "crm_contact",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": true,
        "isDynamic": false,
        "title": "Контакты",
        "upperName": "CONTACTS"
      },
      "observers": {
        "type": "user",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": true,
        "isDynamic": false,
        "title": "Наблюдатели",
        "upperName": "OBSERVERS"
      },
      "categoryId": {
        "type": "crm_category",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Воронка",
        "upperName": "CATEGORY_ID"
      },
      "movedTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата изменения стадии",
        "upperName": "MOVED_TIME"
      },
      "movedBy": {
        "type": "user",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Кто изменил стадию",
        "upperName": "MOVED_BY"
      },
      "stageId": {
        "type": "crm_status",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "statusType": "DYNAMIC_1062_STAGE_24",
        "title": "Стадия",
        "upperName": "STAGE_ID"
      },
      "previousStageId": {
        "type": "crm_status",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "statusType": "DYNAMIC_1062_STAGE_24",
        "title": "Предыдущая стадия",
        "upperName": "PREVIOUS_STAGE_ID"
      },
      "sourceId": {
        "type": "crm_status",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "statusType": "SOURCE",
        "title": "Источник",
        "upperName": "SOURCE_ID"
      },
      "sourceDescription": {
        "type": "text",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дополнительно об источнике",
        "upperName": "SOURCE_DESCRIPTION"
      },
      "mycompanyId": {
        "type": "crm_company",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Реквизиты вашей компании",
        "settings": {
          "isMyCompany": true,
          "parentEntityTypeId": 4,
          "isEmbeddedEditorEnabled": true
        },
        "upperName": "MYCOMPANY_ID"
      },
      "lastActivityBy": {
        "type": "user",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Автор последней активности в таймлайне",
        "upperName": "LAST_ACTIVITY_BY"
      },
      "lastActivityTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Последняя активность",
        "upperName": "LAST_ACTIVITY_TIME"
      },
      "isRecurring": {
        "type": "boolean",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Регулярный элемент",
        "upperName": "IS_RECURRING"
      },
      "lastCommunicationCallTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата последнего звонка",
        "upperName": "LAST_COMMUNICATION_CALL_TIME"
      },
      "lastCommunicationEmailTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата последнего e-mail",
        "upperName": "LAST_COMMUNICATION_EMAIL_TIME"
      },
      "lastCommunicationImolTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата последнего диалога в открытой линии",
        "upperName": "LAST_COMMUNICATION_IMOL_TIME"
      },
      "lastCommunicationWebformTime": {
        "type": "datetime",
        "isRequired": false,
        "isReadOnly": true,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": false,
        "title": "Дата последнего заполнения CRM-формы",
        "upperName": "LAST_COMMUNICATION_WEBFORM_TIME"
      },
      "ufCrm18_1788502602": {
        "type": "enumeration",
        "isRequired": true,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3476",
            "VALUE": "IT поддержк"
          },
          {
            "ID": "3478",
            "VALUE": "Поддержка SAP"
          },
          {
            "ID": "3480",
            "VALUE": "Windchill"
          },
          {
            "ID": "3482",
            "VALUE": "Телефония"
          },
          {
            "ID": "3484",
            "VALUE": "Электронная почта"
          },
          {
            "ID": "3486",
            "VALUE": "Система видеонаблюдения"
          },
          {
            "ID": "3488",
            "VALUE": "Закупка IT Оборудования или ПО"
          },
          {
            "ID": "3490",
            "VALUE": "Система 1С"
          }
        ],
        "title": "Направление",
        "listLabel": "",
        "formLabel": "Направление",
        "filterLabel": "",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788502602"
      },
      "ufCrm18_1788502688": {
        "type": "enumeration",
        "isRequired": true,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3492",
            "VALUE": "Низкий"
          },
          {
            "ID": "3494",
            "VALUE": "Средний"
          },
          {
            "ID": "3496",
            "VALUE": "Высокий"
          }
        ],
        "title": "Приоритет",
        "listLabel": "",
        "formLabel": "Приоритет",
        "filterLabel": "",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788502688"
      },
      "ufCrm18_1788502725": {
        "type": "enumeration",
        "isRequired": true,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3498",
            "VALUE": "Да"
          },
          {
            "ID": "3500",
            "VALUE": "Нет"
          }
        ],
        "title": "Требуется согласование руководителя",
        "listLabel": "",
        "formLabel": "Требуется согласование руководителя",
        "filterLabel": "",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788502725"
      },
      "ufCrm18_1788502823": {
        "type": "enumeration",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3502",
            "VALUE": "Да"
          },
          {
            "ID": "3504",
            "VALUE": "Нет"
          }
        ],
        "title": "Требуется закупка оборудования/ПО",
        "listLabel": "Требуется закупка оборудования/ПО",
        "formLabel": "Требуется закупка оборудования/ПО",
        "filterLabel": "Требуется закупка оборудования/ПО",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788502823"
      },
      "ufCrm18_1788502956": {
        "type": "string",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Причина возврата / доработки",
        "listLabel": "Причина возврата / доработки",
        "formLabel": "Причина возврата / доработки",
        "filterLabel": "Причина возврата / доработки",
        "settings": {
          "SIZE": 20,
          "ROWS": 1,
          "REGEXP": "",
          "MIN_LENGTH": 0,
          "MAX_LENGTH": 0,
          "DEFAULT_VALUE": ""
        },
        "upperName": "UF_CRM_18_1788502956"
      },
      "ufCrm18_1788503022": {
        "type": "enumeration",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3506",
            "VALUE": "Дубликат"
          },
          {
            "ID": "3508",
            "VALUE": "Ошибка пользователя"
          },
          {
            "ID": "3510",
            "VALUE": "Отпала необходимость, Другое."
          },
          {
            "ID": "3512",
            "VALUE": "Другое"
          }
        ],
        "title": "Причина удаления",
        "listLabel": "Причина удаления",
        "formLabel": "Причина удаления",
        "filterLabel": "Причина удаления",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788503022"
      },
      "ufCrm18_1788503115": {
        "type": "file",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Документы",
        "listLabel": "",
        "formLabel": "Документы",
        "filterLabel": "",
        "settings": {
          "SIZE": 20,
          "LIST_WIDTH": 0,
          "LIST_HEIGHT": 0,
          "MAX_SHOW_SIZE": 0,
          "MAX_ALLOWED_SIZE": 0,
          "EXTENSIONS": [],
          "TARGET_BLANK": "Y",
          "DEFAULT_VIEW": null
        },
        "upperName": "UF_CRM_18_1788503115"
      },
      "ufCrm18_1788503154": {
        "type": "string",
        "isRequired": true,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Описание задачи",
        "listLabel": "",
        "formLabel": "Описание задачи",
        "filterLabel": "",
        "settings": {
          "SIZE": 20,
          "ROWS": 1,
          "REGEXP": "",
          "MIN_LENGTH": 0,
          "MAX_LENGTH": 0,
          "DEFAULT_VALUE": ""
        },
        "upperName": "UF_CRM_18_1788503154"
      },
      "ufCrm18_1788503492": {
        "type": "datetime",
        "isRequired": true,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Крайний срок задачи",
        "listLabel": "",
        "formLabel": "Крайний срок задачи",
        "filterLabel": "",
        "settings": {
          "DEFAULT_VALUE": {
            "TYPE": "NONE",
            "VALUE": ""
          },
          "USE_SECOND": "Y",
          "USE_TIMEZONE": "N"
        },
        "upperName": "UF_CRM_18_1788503492"
      },
      "ufCrm18_1788506045": {
        "type": "employee",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Предыдущий исполнитель",
        "listLabel": "",
        "formLabel": "Предыдущий исполнитель",
        "filterLabel": "",
        "settings": {
          "DEFAULT_VALUE": []
        },
        "upperName": "UF_CRM_18_1788506045"
      },
      "ufCrm18_1788506433": {
        "type": "enumeration",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3514",
            "VALUE": "Да"
          },
          {
            "ID": "3516",
            "VALUE": "Нет"
          }
        ],
        "title": "На проверку",
        "listLabel": "На проверку",
        "formLabel": "На проверку",
        "filterLabel": "На проверку",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788506433"
      },
      "ufCrm18_1788508784": {
        "type": "employee",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Ответственный руководитель",
        "listLabel": "Ответственный руководитель",
        "formLabel": "Ответственный руководитель",
        "filterLabel": "Ответственный руководитель",
        "settings": {
          "DEFAULT_VALUE": []
        },
        "upperName": "UF_CRM_18_1788508784"
      },
      "ufCrm18_1788508940": {
        "type": "employee",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "title": "Исполнитель",
        "listLabel": "Исполнитель",
        "formLabel": "Исполнитель",
        "filterLabel": "Исполнитель",
        "settings": {
          "DEFAULT_VALUE": []
        },
        "upperName": "UF_CRM_18_1788508940"
      },
      "ufCrm18_1788509675": {
        "type": "enumeration",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3518",
            "VALUE": "Черновик"
          },
          {
            "ID": "3520",
            "VALUE": "На согласовании с руководителем"
          },
          {
            "ID": "3522",
            "VALUE": "Бэклог / Распределение"
          },
          {
            "ID": "3524",
            "VALUE": "В ожидании работы (исполнитель-оценка)"
          },
          {
            "ID": "3526",
            "VALUE": "Согласование комплектующих (Директор)"
          },
          {
            "ID": "3528",
            "VALUE": "Согласование цен (Закупка)"
          },
          {
            "ID": "3530",
            "VALUE": "Окончательное согласование цены (Директор)"
          },
          {
            "ID": "3532",
            "VALUE": "В ожидании работы (исполнитель)"
          },
          {
            "ID": "3534",
            "VALUE": "В работе"
          },
          {
            "ID": "3536",
            "VALUE": "В ожидании (на паузе)"
          },
          {
            "ID": "3538",
            "VALUE": "На проверке"
          }
        ],
        "title": "Откуда возвращено",
        "listLabel": "",
        "formLabel": "Откуда возвращено",
        "filterLabel": "",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788509675"
      },
      "ufCrm18_1788768850": {
        "type": "enumeration",
        "isRequired": false,
        "isReadOnly": false,
        "isImmutable": false,
        "isMultiple": false,
        "isDynamic": true,
        "items": [
          {
            "ID": "3544",
            "VALUE": "Да"
          },
          {
            "ID": "3546",
            "VALUE": "Нет"
          },
          {
            "ID": "3548",
            "VALUE": "Не требуеться"
          }
        ],
        "title": "Исправлено",
        "listLabel": "",
        "formLabel": "Исправлено",
        "filterLabel": "",
        "settings": {
          "DISPLAY": "LIST",
          "LIST_HEIGHT": 1,
          "CAPTION_NO_VALUE": "",
          "SHOW_NO_VALUE": "Y"
        },
        "upperName": "UF_CRM_18_1788768850"
      }
    }
  },
  "time": {
    "start": 1788780303,
    "finish": 1788780303.918922,
    "duration": 0.918921947479248,
    "processing": 0,
    "date_start": "2026-09-07T14:25:03+03:00",
    "date_finish": "2026-09-07T14:25:03+03:00",
    "operating_reset_at": 1788780903,
    "operating": 0
  }
}
```

### 3. Внешний вид (настройки) карточки

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.item.details.configuration.get
```

```json
{
  "entityTypeId": 1062
}

{
  "result": null,
  "time": {
    "start": 1788780422,
    "finish": 1788780422.652291,
    "duration": 0.6522910594940186,
    "processing": 0,
    "date_start": "2026-09-07T14:27:02+03:00",
    "date_finish": "2026-09-07T14:27:02+03:00",
    "operating_reset_at": 1788781022,
    "operating": 0
  }
}
```

### 4. Воронки (Направления)

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.category.list
```

```json
{
  "entityTypeId": 1062
}

{
  "result": {
    "categories": [
      {
        "id": 24,
        "name": "Общая воронка",
        "sort": 500,
        "entityTypeId": 1062,
        "isDefault": "Y"
      },
      {
        "id": 26,
        "name": "Новая воронка",
        "sort": 510,
        "entityTypeId": 1062,
        "isDefault": "N"
      }
    ]
  },
  "total": 2,
  "time": {
    "start": 1788780494,
    "finish": 1788780494.30814,
    "duration": 0.3081400394439697,
    "processing": 0,
    "date_start": "2026-09-07T14:28:14+03:00",
    "date_finish": "2026-09-07T14:28:14+03:00",
    "operating_reset_at": 1788781094,
    "operating": 0
  }
}
```

### 5. Стадии (Этапы)

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/crm.status.list
```

```json
{
  "filter": {
    "ENTITY_ID": "DYNAMIC_128_STAGE_0"
  }
}

{
  "result": [
    {
      "ID": "35",
      "ENTITY_ID": "CONTACT_TYPE",
      "STATUS_ID": "CLIENT",
      "NAME": "Клиенты",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "43",
      "ENTITY_ID": "COMPANY_TYPE",
      "STATUS_ID": "CUSTOMER",
      "NAME": "Клиент",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "53",
      "ENTITY_ID": "EMPLOYEES",
      "STATUS_ID": "EMPLOYEES_1",
      "NAME": "менее 50",
      "NAME_INIT": "менее 50",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "61",
      "ENTITY_ID": "CALL_LIST",
      "STATUS_ID": "IN_WORK",
      "NAME": "В работе",
      "NAME_INIT": "В работе",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "89",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "OTHER",
      "NAME": "Легкая промышленность",
      "NAME_INIT": "Другое",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "91",
      "ENTITY_ID": "DEAL_TYPE",
      "STATUS_ID": "SALE",
      "NAME": "Новая сделка",
      "NAME_INIT": "Продажа",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "101",
      "ENTITY_ID": "DEAL_STAGE",
      "STATUS_ID": "NEW",
      "NAME": "Новая заявка",
      "NAME_INIT": "Новая",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#39a8ef",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#39a8ef"
      }
    },
    {
      "ID": "117",
      "ENTITY_ID": "DEAL_STATE",
      "STATUS_ID": "PLANNED",
      "NAME": "В планах",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "125",
      "ENTITY_ID": "EVENT_TYPE",
      "STATUS_ID": "INFO",
      "NAME": "Информация",
      "NAME_INIT": "Информация",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "131",
      "ENTITY_ID": "QUOTE_STATUS",
      "STATUS_ID": "DRAFT",
      "NAME": "Новое",
      "NAME_INIT": "Новое",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#39A8EF",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#39A8EF"
      }
    },
    {
      "ID": "149",
      "ENTITY_ID": "HONORIFIC",
      "STATUS_ID": "HNR_RU_1",
      "NAME": "г-н",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "152",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:DRAFT",
      "NAME": "Черновик",
      "NAME_INIT": "Черновик",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#00A9F4",
      "SEMANTICS": null,
      "CATEGORY_ID": "6"
    },
    {
      "ID": "166",
      "ENTITY_ID": "SMART_INVOICE_STAGE_8",
      "STATUS_ID": "DT31_8:N",
      "NAME": "Новый",
      "NAME_INIT": "Новый",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#39A8EF",
      "SEMANTICS": null,
      "CATEGORY_ID": "8"
    },
    {
      "ID": "320",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:DRAFT",
      "NAME": "Черновик",
      "NAME_INIT": "Черновик",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#00A9F4",
      "SEMANTICS": "",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "480",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:NEW",
      "NAME": "Теплый клиент",
      "NAME_INIT": "Новая",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#39a8ef",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#39a8ef"
      }
    },
    {
      "ID": "630",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "1",
      "NAME": "Ручное создание",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "636",
      "ENTITY_ID": "DYNAMIC_1032_STAGE_12",
      "STATUS_ID": "DT1032_12:NEW",
      "NAME": "Начало",
      "NAME_INIT": "Начало",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#22B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "12"
    },
    {
      "ID": "646",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_14",
      "STATUS_ID": "DT39_14:EMPLOYEE_DRAFT",
      "NAME": "Черновик",
      "NAME_INIT": "Черновик",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#00A9F4",
      "SEMANTICS": null,
      "CATEGORY_ID": "14"
    },
    {
      "ID": "678",
      "ENTITY_ID": "DYNAMIC_1044_STAGE_16",
      "STATUS_ID": "DT1044_16:NEW",
      "NAME": "Начало",
      "NAME_INIT": "Начало",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#22B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "16"
    },
    {
      "ID": "730",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:NEW",
      "NAME": "НОВЫЙ КЛИЕНТ",
      "NAME_INIT": "Новая",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#aae9fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#aae9fc"
      }
    },
    {
      "ID": "758",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "UC_P2ETW2",
      "NAME": "ЗАЯВКА ПОЛУЧЕНА",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#c5e099",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#c5e099"
      }
    },
    {
      "ID": "784",
      "ENTITY_ID": "DEAL_STAGE_42",
      "STATUS_ID": "C42:NEW",
      "NAME": "Контракт активен",
      "NAME_INIT": "Новая",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#c5e099",
      "SEMANTICS": null,
      "CATEGORY_ID": "42",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#c5e099"
      }
    },
    {
      "ID": "846",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:UC_0RZCPR",
      "NAME": "На доработке (Инициатор)",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#bfc5cd",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "854",
      "ENTITY_ID": "DYNAMIC_1054_STAGE_20",
      "STATUS_ID": "DT1054_20:NEW",
      "NAME": "Начало",
      "NAME_INIT": "Начало",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#22B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "20"
    },
    {
      "ID": "864",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:NEW",
      "NAME": "Первичное интервью HR",
      "NAME_INIT": "Начало",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#22b9ff",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "922",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_GFOHNW",
      "NAME": "Отклонено / На доработку",
      "NAME_INIT": "",
      "SORT": "10",
      "SYSTEM": "N",
      "COLOR": "#75d900",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "924",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_26",
      "STATUS_ID": "DT1062_26:NEW",
      "NAME": "Начало",
      "NAME_INIT": "Начало",
      "SORT": "10",
      "SYSTEM": "Y",
      "COLOR": "#22B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "26"
    },
    {
      "ID": "1",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "NEW",
      "NAME": "ОБРАЩЕНИЕ ПОСТУПИЛО",
      "NAME_INIT": "Не обработан",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": "#ffcbd8",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ffcbd8"
      }
    },
    {
      "ID": "19",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "PARTNER",
      "NAME": "Существующий клиент",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "37",
      "ENTITY_ID": "CONTACT_TYPE",
      "STATUS_ID": "SUPPLIER",
      "NAME": "Поставщики",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "45",
      "ENTITY_ID": "COMPANY_TYPE",
      "STATUS_ID": "SUPPLIER",
      "NAME": "Поставщик",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "55",
      "ENTITY_ID": "EMPLOYEES",
      "STATUS_ID": "EMPLOYEES_2",
      "NAME": "50-100",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "63",
      "ENTITY_ID": "CALL_LIST",
      "STATUS_ID": "SUCCESS",
      "NAME": "Успешно",
      "NAME_INIT": "Успешно",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "93",
      "ENTITY_ID": "DEAL_TYPE",
      "STATUS_ID": "COMPLEX",
      "NAME": "Повторный заказ",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "119",
      "ENTITY_ID": "DEAL_STATE",
      "STATUS_ID": "PROCESS",
      "NAME": "В работе",
      "NAME_INIT": "В работе",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "127",
      "ENTITY_ID": "EVENT_TYPE",
      "STATUS_ID": "PHONE",
      "NAME": "Телефонный звонок",
      "NAME_INIT": "Телефонный звонок",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "133",
      "ENTITY_ID": "QUOTE_STATUS",
      "STATUS_ID": "SENT",
      "NAME": "Отправлено клиенту",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#2FC6F6",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#2FC6F6"
      }
    },
    {
      "ID": "151",
      "ENTITY_ID": "HONORIFIC",
      "STATUS_ID": "HNR_RU_2",
      "NAME": "г-жа",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "154",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:PROCESSING",
      "NAME": "На согласовании",
      "NAME_INIT": "На согласовании",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#00C9FA",
      "SEMANTICS": null,
      "CATEGORY_ID": "6"
    },
    {
      "ID": "168",
      "ENTITY_ID": "SMART_INVOICE_STAGE_8",
      "STATUS_ID": "DT31_8:S",
      "NAME": "Отправлен клиенту",
      "NAME_INIT": "Отправлен клиенту",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#2FC6F6",
      "SEMANTICS": null,
      "CATEGORY_ID": "8"
    },
    {
      "ID": "322",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:COORDINATION",
      "NAME": "Согласование",
      "NAME_INIT": "Согласование",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#00C9FA",
      "SEMANTICS": "",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "500",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_T3G3PF",
      "NAME": "Первый контакт",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "544",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:NEW",
      "NAME": "ЗАЯВКА В РАБОТУ ПОЛУЧЕНА",
      "NAME_INIT": "Новая",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": "#39a8ef",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#39a8ef"
      }
    },
    {
      "ID": "600",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_VPR53U",
      "NAME": "Лесная промышленность",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "638",
      "ENTITY_ID": "DYNAMIC_1032_STAGE_12",
      "STATUS_ID": "DT1032_12:PREPARATION",
      "NAME": "Подготовка",
      "NAME_INIT": "Подготовка",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#88B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "12"
    },
    {
      "ID": "648",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_14",
      "STATUS_ID": "DT39_14:EMPLOYEE_COORDINATION",
      "NAME": "Согласование",
      "NAME_INIT": "Согласование",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#00C9FA",
      "SEMANTICS": null,
      "CATEGORY_ID": "14"
    },
    {
      "ID": "680",
      "ENTITY_ID": "DYNAMIC_1044_STAGE_16",
      "STATUS_ID": "DT1044_16:PREPARATION",
      "NAME": "Подготовка",
      "NAME_INIT": "Подготовка",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#88B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "16"
    },
    {
      "ID": "802",
      "ENTITY_ID": "DEAL_STAGE_42",
      "STATUS_ID": "C42:UC_6CYMFF",
      "NAME": "30 дней до завершения",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#f0008c",
      "SEMANTICS": null,
      "CATEGORY_ID": "42",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#f0008c"
      }
    },
    {
      "ID": "812",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:UC_49E499",
      "NAME": "Название",
      "NAME_INIT": "",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#00c4fb"
      }
    },
    {
      "ID": "830",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:NEW",
      "NAME": "Черновик",
      "NAME_INIT": "Начало",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": "#ffffff",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "856",
      "ENTITY_ID": "DYNAMIC_1054_STAGE_20",
      "STATUS_ID": "DT1054_20:PREPARATION",
      "NAME": "Подготовка",
      "NAME_INIT": "Подготовка",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#88B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "20"
    },
    {
      "ID": "866",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:PREPARATION",
      "NAME": "Согласование собеседования",
      "NAME_INIT": "Подготовка",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#88b9ff",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "894",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:NEW",
      "NAME": "Черновик",
      "NAME_INIT": "Начало",
      "SORT": "20",
      "SYSTEM": "Y",
      "COLOR": "#a1a6ac",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "926",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_26",
      "STATUS_ID": "DT1062_26:PREPARATION",
      "NAME": "Подготовка",
      "NAME_INIT": "Подготовка",
      "SORT": "20",
      "SYSTEM": "N",
      "COLOR": "#88B9FF",
      "SEMANTICS": null,
      "CATEGORY_ID": "26"
    },
    {
      "ID": "11",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "CALL",
      "NAME": "Звонок",
      "NAME_INIT": "Звонок",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "39",
      "ENTITY_ID": "CONTACT_TYPE",
      "STATUS_ID": "PARTNER",
      "NAME": "Партнеры",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "47",
      "ENTITY_ID": "COMPANY_TYPE",
      "STATUS_ID": "COMPETITOR",
      "NAME": "Конкурент",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "57",
      "ENTITY_ID": "EMPLOYEES",
      "STATUS_ID": "EMPLOYEES_3",
      "NAME": "100-250",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "65",
      "ENTITY_ID": "CALL_LIST",
      "STATUS_ID": "WRONG_NUMBER",
      "NAME": "Неверный номер",
      "NAME_INIT": "Неверный номер",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "121",
      "ENTITY_ID": "DEAL_STATE",
      "STATUS_ID": "COMPLETE",
      "NAME": "Выполнена",
      "NAME_INIT": "Выполнена",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "129",
      "ENTITY_ID": "EVENT_TYPE",
      "STATUS_ID": "MESSAGE",
      "NAME": "Отправлен email",
      "NAME_INIT": "Отправлен email",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "135",
      "ENTITY_ID": "QUOTE_STATUS",
      "STATUS_ID": "APPROVED",
      "NAME": "Принято",
      "NAME_INIT": "Принято",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7BD500"
      }
    },
    {
      "ID": "156",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:SENT",
      "NAME": "Отправлен",
      "NAME_INIT": "Отправлен",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#00D3E2",
      "SEMANTICS": null,
      "CATEGORY_ID": "6"
    },
    {
      "ID": "170",
      "ENTITY_ID": "SMART_INVOICE_STAGE_8",
      "STATUS_ID": "DT31_8:P",
      "NAME": "Оплачен",
      "NAME_INIT": "Оплачен",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "8"
    },
    {
      "ID": "324",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:FILLING",
      "NAME": "Заполнение",
      "NAME_INIT": "Заполнение",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#00C4FB",
      "SEMANTICS": "",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "502",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_0DPHCN",
      "NAME": "Получение технического задания (ТЗ)",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "578",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_M7TM3X",
      "NAME": "ТЕХНОЛОГУ ПЕРЕДАН",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#c4baed",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#c4baed"
      }
    },
    {
      "ID": "602",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_CDEVPM",
      "NAME": "Машиностроение и металлообработка",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "640",
      "ENTITY_ID": "DYNAMIC_1032_STAGE_12",
      "STATUS_ID": "DT1032_12:CLIENT",
      "NAME": "Согласование",
      "NAME_INIT": "Согласование",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "12"
    },
    {
      "ID": "650",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_14",
      "STATUS_ID": "DT39_14:EMPLOYEE_SIGNING",
      "NAME": "Подписание",
      "NAME_INIT": "Подписание",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#00D3E2",
      "SEMANTICS": null,
      "CATEGORY_ID": "14"
    },
    {
      "ID": "682",
      "ENTITY_ID": "DYNAMIC_1044_STAGE_16",
      "STATUS_ID": "DT1044_16:CLIENT",
      "NAME": "Согласование",
      "NAME_INIT": "Согласование",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "16"
    },
    {
      "ID": "732",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:PREPARATION",
      "NAME": "ЛПР ВЫЯВЛЕН",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#a3d49b",
      "SEMANTICS": null,
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#a3d49b"
      }
    },
    {
      "ID": "754",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "UC_ZPOHOB",
      "NAME": "ЗАЯВКА КВАЛИФИЦИРОВАНА",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#10e5fc"
      }
    },
    {
      "ID": "794",
      "ENTITY_ID": "DEAL_STAGE_42",
      "STATUS_ID": "C42:WON",
      "NAME": "Сделка успешна",
      "NAME_INIT": "Сделка успешна",
      "SORT": "30",
      "SYSTEM": "Y",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "42",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7BD500"
      }
    },
    {
      "ID": "832",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:PREPARATION",
      "NAME": "Согласование руководителем подразделения",
      "NAME_INIT": "Подготовка",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#fff55a",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "858",
      "ENTITY_ID": "DYNAMIC_1054_STAGE_20",
      "STATUS_ID": "DT1054_20:CLIENT",
      "NAME": "Согласование",
      "NAME_INIT": "Согласование",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "20"
    },
    {
      "ID": "888",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_1R2Y6V",
      "NAME": "Собеседование запланировано",
      "NAME_INIT": "",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "896",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:PREPARATION",
      "NAME": "На согласовании с руководителем",
      "NAME_INIT": "Подготовка",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#88b9ff",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "928",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_26",
      "STATUS_ID": "DT1062_26:CLIENT",
      "NAME": "Согласование",
      "NAME_INIT": "Согласование",
      "SORT": "30",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "26"
    },
    {
      "ID": "7",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "CONVERTED",
      "NAME": "ЗАЯВКА В СДЕЛКИ",
      "NAME_INIT": "Качественный лид",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#7bd500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7bd500"
      }
    },
    {
      "ID": "13",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "EMAIL",
      "NAME": "Электронная почта",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "41",
      "ENTITY_ID": "CONTACT_TYPE",
      "STATUS_ID": "OTHER",
      "NAME": "Другое",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "49",
      "ENTITY_ID": "COMPANY_TYPE",
      "STATUS_ID": "PARTNER",
      "NAME": "Партнер",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "59",
      "ENTITY_ID": "EMPLOYEES",
      "STATUS_ID": "EMPLOYEES_4",
      "NAME": "250-500",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "67",
      "ENTITY_ID": "CALL_LIST",
      "STATUS_ID": "STOP_CALLING",
      "NAME": "Больше не звонить",
      "NAME_INIT": "Больше не звонить",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "103",
      "ENTITY_ID": "DEAL_STAGE",
      "STATUS_ID": "PREPARATION",
      "NAME": "Заявка проценивается",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#2fc6f6",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#2fc6f6"
      }
    },
    {
      "ID": "123",
      "ENTITY_ID": "DEAL_STATE",
      "STATUS_ID": "CANCELED",
      "NAME": "Отменена",
      "NAME_INIT": "Отменена",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "137",
      "ENTITY_ID": "QUOTE_STATUS",
      "STATUS_ID": "DECLAINED",
      "NAME": "Отклонено",
      "NAME_INIT": "Отклонено",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#FF5752"
      }
    },
    {
      "ID": "158",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:SEMISIGNED",
      "NAME": "Частично подписан",
      "NAME_INIT": "Частично подписан",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#FEA300",
      "SEMANTICS": null,
      "CATEGORY_ID": "6"
    },
    {
      "ID": "172",
      "ENTITY_ID": "SMART_INVOICE_STAGE_8",
      "STATUS_ID": "DT31_8:D",
      "NAME": "Не оплачен",
      "NAME_INIT": "Не оплачен",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "8"
    },
    {
      "ID": "326",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:SIGNING",
      "NAME": "Подписание",
      "NAME_INIT": "Подписание",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#00D3E2",
      "SEMANTICS": "",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "516",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_ICGSCU",
      "NAME": "В расчете",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#00c4fb"
      }
    },
    {
      "ID": "604",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_XAAG2N",
      "NAME": "Медицинская промышленность",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "642",
      "ENTITY_ID": "DYNAMIC_1032_STAGE_12",
      "STATUS_ID": "DT1032_12:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "12"
    },
    {
      "ID": "652",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_14",
      "STATUS_ID": "DT39_14:EMPLOYEE_COMPLETED",
      "NAME": "Результат",
      "NAME_INIT": "Результат",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#FEA300",
      "SEMANTICS": null,
      "CATEGORY_ID": "14"
    },
    {
      "ID": "684",
      "ENTITY_ID": "DYNAMIC_1044_STAGE_16",
      "STATUS_ID": "DT1044_16:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "16"
    },
    {
      "ID": "690",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:1",
      "NAME": "ПРОСЧЕТ ТЕХНОЛОГА ПОЛУЧЕН",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#a284bf",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#a284bf"
      }
    },
    {
      "ID": "734",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:PREPAYMENT_INVOIC",
      "NAME": "НА ЗАЯВКУ ДОГОВОРИЛИСЬ",
      "NAME_INIT": "",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#fff55a",
      "SEMANTICS": null,
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#fff55a"
      }
    },
    {
      "ID": "796",
      "ENTITY_ID": "DEAL_STAGE_42",
      "STATUS_ID": "C42:LOSE",
      "NAME": "Контракт не продлен",
      "NAME_INIT": "Сделка провалена",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "42",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "860",
      "ENTITY_ID": "DYNAMIC_1054_STAGE_20",
      "STATUS_ID": "DT1054_20:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "20"
    },
    {
      "ID": "868",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:CLIENT",
      "NAME": "Собеседование подтверждено",
      "NAME_INIT": "Согласование",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "898",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:CLIENT",
      "NAME": "Бэклог / Распределение",
      "NAME_INIT": "Согласование",
      "SORT": "40",
      "SYSTEM": "N",
      "COLOR": "#10e5fc",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "930",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_26",
      "STATUS_ID": "DT1062_26:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "40",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "26"
    },
    {
      "ID": "9",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "JUNK",
      "NAME": "Отложенный спрос",
      "NAME_INIT": "Некачественный лид",
      "SORT": "50",
      "SYSTEM": "Y",
      "COLOR": "#f36509",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#f36509"
      }
    },
    {
      "ID": "15",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "WEB",
      "NAME": "Веб-сайт",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "51",
      "ENTITY_ID": "COMPANY_TYPE",
      "STATUS_ID": "OTHER",
      "NAME": "Другое",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "105",
      "ENTITY_ID": "DEAL_STAGE",
      "STATUS_ID": "PREPAYMENT_INVOICE",
      "NAME": "Отправлено КП",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#55d0e0",
      "SEMANTICS": null,
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#55d0e0"
      }
    },
    {
      "ID": "139",
      "ENTITY_ID": "QUOTE_STATUS",
      "STATUS_ID": "APOLOGY",
      "NAME": "Анализ причины отклонения",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#FF5752"
      }
    },
    {
      "ID": "160",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:SIGNED",
      "NAME": "Полностью подписан",
      "NAME_INIT": "Полностью подписан",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#47E4C2",
      "SEMANTICS": null,
      "CATEGORY_ID": "6"
    },
    {
      "ID": "328",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:COMPLETED",
      "NAME": "Результат",
      "NAME_INIT": "Результат",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#FEA300",
      "SEMANTICS": "",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "504",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_85MULP",
      "NAME": "Составление коммерческого предложения (КП)",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "586",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_DD010I",
      "NAME": "ЭКОНОМИСТУ ПЕРЕДАНО",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#f968b6",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#f968b6"
      }
    },
    {
      "ID": "598",
      "ENTITY_ID": "EMPLOYEES",
      "STATUS_ID": "UC_RUTDDX",
      "NAME": "Более 500",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "606",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_VNCUCP",
      "NAME": "Металлургия",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "644",
      "ENTITY_ID": "DYNAMIC_1032_STAGE_12",
      "STATUS_ID": "DT1032_12:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "50",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "12"
    },
    {
      "ID": "654",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_14",
      "STATUS_ID": "DT39_14:ARCHIVE",
      "NAME": "В архиве",
      "NAME_INIT": "В архиве",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "14"
    },
    {
      "ID": "686",
      "ENTITY_ID": "DYNAMIC_1044_STAGE_16",
      "STATUS_ID": "DT1044_16:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "50",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "16"
    },
    {
      "ID": "834",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:CLIENT",
      "NAME": "Контроль Казначейства",
      "NAME_INIT": "Согласование",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#a3d49b",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "862",
      "ENTITY_ID": "DYNAMIC_1054_STAGE_20",
      "STATUS_ID": "DT1054_20:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "50",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "20"
    },
    {
      "ID": "874",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_T338MI",
      "NAME": "Итоги собеседования",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "904",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_APSSZR",
      "NAME": "В ожидании работы (исполнитель-оценка)",
      "NAME_INIT": "",
      "SORT": "50",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "932",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_26",
      "STATUS_ID": "DT1062_26:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "50",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "26"
    },
    {
      "ID": "17",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "ADVERTISING",
      "NAME": "Реклама",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "111",
      "ENTITY_ID": "DEAL_STAGE",
      "STATUS_ID": "WON",
      "NAME": "Сделка успешна",
      "NAME_INIT": "Сделка успешна",
      "SORT": "60",
      "SYSTEM": "Y",
      "COLOR": "#7bd500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7bd500"
      }
    },
    {
      "ID": "162",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:ARCHIVE",
      "NAME": "В архив",
      "NAME_INIT": "В архив",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "6"
    },
    {
      "ID": "330",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:ARCHIVE",
      "NAME": "В архиве",
      "NAME_INIT": "В архиве",
      "SORT": "60",
      "SYSTEM": "Y",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "374",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "UC_BNKFCW",
      "NAME": "Не целевой",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "506",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_HS7PM8",
      "NAME": "Переговоры",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "608",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_W2LDVA",
      "NAME": "Пищевая и с/х промышленность",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "656",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_14",
      "STATUS_ID": "DT39_14:FAILURE",
      "NAME": "Не подписано",
      "NAME_INIT": "Не подписано",
      "SORT": "60",
      "SYSTEM": "Y",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "14"
    },
    {
      "ID": "740",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:WON",
      "NAME": "ЗАЯВКА ПОЛУЧЕНА",
      "NAME_INIT": "Сделка успешна",
      "SORT": "60",
      "SYSTEM": "Y",
      "COLOR": "#7bd500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7bd500"
      }
    },
    {
      "ID": "840",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:UC_ARHSRZ",
      "NAME": "Утверждение Реестра",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#c4baed",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "876",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_NO3VIE",
      "NAME": "Согласование условий оффера",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#47d1e2",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "906",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_C1KEEH",
      "NAME": "Согласование комплектующих (Директор)",
      "NAME_INIT": "",
      "SORT": "60",
      "SYSTEM": "N",
      "COLOR": "#47d1e2",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "21",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "RECOMMENDATION",
      "NAME": "По рекомендации",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "113",
      "ENTITY_ID": "DEAL_STAGE",
      "STATUS_ID": "LOSE",
      "NAME": "Заявка не сработала или отложена",
      "NAME_INIT": "Сделка провалена",
      "SORT": "70",
      "SYSTEM": "Y",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "164",
      "ENTITY_ID": "SMART_DOCUMENT_STAGE_6",
      "STATUS_ID": "DT36_6:NOTSIGNED",
      "NAME": "Не подписано",
      "NAME_INIT": "Не подписано",
      "SORT": "70",
      "SYSTEM": "Y",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "6"
    },
    {
      "ID": "332",
      "ENTITY_ID": "SMART_B2E_DOC_STAGE_10",
      "STATUS_ID": "DT39_10:FAILURE",
      "NAME": "Не подписано",
      "NAME_INIT": "Не подписано",
      "SORT": "70",
      "SYSTEM": "Y",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "10"
    },
    {
      "ID": "376",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "UC_PA7BPZ",
      "NAME": "Спам",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "508",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_ZNC6Y1",
      "NAME": "Заключения договора",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "610",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_AT179M",
      "NAME": "Полезные ископаемые",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "634",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_F6D8RP",
      "NAME": "КП ОТПРАВЛЕНО",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#a5de00",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#a5de00"
      }
    },
    {
      "ID": "742",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:LOSE",
      "NAME": "Сделка провалена",
      "NAME_INIT": "Сделка провалена",
      "SORT": "70",
      "SYSTEM": "Y",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "842",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:UC_0VWMP8",
      "NAME": "В работе (Бухгалтерия)",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#0052a7",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "880",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_Y67EP3",
      "NAME": "Оффер направлен",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#ffab00",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "908",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_F3ZUSK",
      "NAME": "Согласование цен (Закупка)",
      "NAME_INIT": "",
      "SORT": "70",
      "SYSTEM": "N",
      "COLOR": "#75d900",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "23",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "TRADE_SHOW",
      "NAME": "Выставка",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "452",
      "ENTITY_ID": "STATUS",
      "STATUS_ID": "UC_HHGM84",
      "NAME": "Дорого",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "510",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_AYQVAO",
      "NAME": "Выполнение заказа",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "588",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_NLITJY",
      "NAME": "ОС ПОЛУЧЕНА (звонок)",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#6ccff7",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#6ccff7"
      }
    },
    {
      "ID": "612",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_AH2Z00",
      "NAME": "Промышленное оборудование",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "744",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:APOLOGY",
      "NAME": "Анализ причины провала",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "844",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:UC_JG2MKD",
      "NAME": "Оплачено",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#75d900",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "882",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_RM3XB5",
      "NAME": "Оффер принят",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#ff5752",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "910",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_76S1NR",
      "NAME": "Окончательное согласование цены (Директор)",
      "NAME_INIT": "",
      "SORT": "80",
      "SYSTEM": "N",
      "COLOR": "#ffab00",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "824",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "BOOKING",
      "NAME": "Онлайн-запись",
      "NAME_INIT": "Онлайн-запись",
      "SORT": "81",
      "SYSTEM": "Y",
      "COLOR": null,
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "25",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "WEBFORM",
      "NAME": "CRM-форма",
      "NAME_INIT": "CRM-форма",
      "SORT": "90",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "512",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_SH0J64",
      "NAME": "Заказ выполнен",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#ace9fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ace9fb"
      }
    },
    {
      "ID": "568",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_ZFF0G6",
      "NAME": "Подготовка и согласование договора",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#fff799",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#fff799"
      }
    },
    {
      "ID": "614",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_KF59SU",
      "NAME": "Прочие промышленные производства",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "780",
      "ENTITY_ID": "DEAL_STAGE_38",
      "STATUS_ID": "C38:UC_UROZPW",
      "NAME": "не целевая заявка",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#ff5b55",
      "SEMANTICS": "F",
      "CATEGORY_ID": "38",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#ff5b55"
      }
    },
    {
      "ID": "848",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:UC_SNCMUZ",
      "NAME": "Отклонено/Аннулировано",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#f36509",
      "SEMANTICS": null,
      "CATEGORY_ID": "18"
    },
    {
      "ID": "884",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_MODPZ9",
      "NAME": "Подготовка к трудоустройству",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#468ee5",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "912",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_SOWUGV",
      "NAME": "В ожидании работы (исполнитель)",
      "NAME_INIT": "",
      "SORT": "90",
      "SYSTEM": "N",
      "COLOR": "#ff5752",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "27",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "CALLBACK",
      "NAME": "Обратный звонок",
      "NAME_INIT": "Обратный звонок",
      "SORT": "100",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "141",
      "ENTITY_ID": "INVOICE_STATUS",
      "STATUS_ID": "N",
      "NAME": "Новый",
      "NAME_INIT": "Новый",
      "SORT": "100",
      "SYSTEM": "Y",
      "COLOR": "#39A8EF",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "488",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:FINAL_INVOICE",
      "NAME": "Послепродажное обслуживание",
      "NAME_INIT": "",
      "SORT": "100",
      "SYSTEM": "N",
      "COLOR": "#ffa900",
      "SEMANTICS": null,
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ffa900"
      }
    },
    {
      "ID": "594",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_VOZALK",
      "NAME": "Подписание договора с Заказчиком",
      "NAME_INIT": "",
      "SORT": "100",
      "SYSTEM": "N",
      "COLOR": "#fff467",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#fff467"
      }
    },
    {
      "ID": "616",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_EV8X43",
      "NAME": "Строительные и отделочные материалы",
      "NAME_INIT": "",
      "SORT": "100",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "836",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "100",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "18"
    },
    {
      "ID": "886",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_VOJBD3",
      "NAME": "Трудоустроен",
      "NAME_INIT": "",
      "SORT": "100",
      "SYSTEM": "N",
      "COLOR": "#1eae43",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "914",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_87ROOW",
      "NAME": "В работе",
      "NAME_INIT": "",
      "SORT": "100",
      "SYSTEM": "N",
      "COLOR": "#468ee5",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "29",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "RC_GENERATOR",
      "NAME": "Генератор продаж",
      "NAME_INIT": "Генератор продаж",
      "SORT": "110",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "143",
      "ENTITY_ID": "INVOICE_STATUS",
      "STATUS_ID": "S",
      "NAME": "Отправлен клиенту",
      "NAME_INIT": "",
      "SORT": "110",
      "SYSTEM": "N",
      "COLOR": "#2FC6F6",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "490",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:WON",
      "NAME": "Сделка успешна",
      "NAME_INIT": "Сделка успешна",
      "SORT": "110",
      "SYSTEM": "Y",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7BD500"
      }
    },
    {
      "ID": "546",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:PREPARATION",
      "NAME": "Номер заказа на продажу/выполнение заказа",
      "NAME_INIT": "",
      "SORT": "110",
      "SYSTEM": "N",
      "COLOR": "#fff100",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#fff100"
      }
    },
    {
      "ID": "618",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_OC7ZDC",
      "NAME": "Транспорт и спецтехника",
      "NAME_INIT": "",
      "SORT": "110",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "838",
      "ENTITY_ID": "DYNAMIC_1048_STAGE_18",
      "STATUS_ID": "DT1048_18:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "110",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "18"
    },
    {
      "ID": "890",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_6XBN5Q",
      "NAME": "Отказ",
      "NAME_INIT": "",
      "SORT": "110",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "916",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_M121CD",
      "NAME": "В ожидании (на паузе)",
      "NAME_INIT": "",
      "SORT": "110",
      "SYSTEM": "N",
      "COLOR": "#1eae43",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "31",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "STORE",
      "NAME": "Интернет-магазин",
      "NAME_INIT": "Интернет-магазин",
      "SORT": "120",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "145",
      "ENTITY_ID": "INVOICE_STATUS",
      "STATUS_ID": "P",
      "NAME": "Оплачен",
      "NAME_INIT": "Оплачен",
      "SORT": "120",
      "SYSTEM": "Y",
      "COLOR": "#7BD500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "0"
    },
    {
      "ID": "492",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:LOSE",
      "NAME": "Не наши детали",
      "NAME_INIT": "Сделка провалена",
      "SORT": "120",
      "SYSTEM": "Y",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "552",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:FINAL_INVOICE",
      "NAME": "Пост продажный контакт",
      "NAME_INIT": "",
      "SORT": "120",
      "SYSTEM": "N",
      "COLOR": "#ffa900",
      "SEMANTICS": null,
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "process",
        "COLOR": "#ffa900"
      }
    },
    {
      "ID": "620",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_NCWFLF",
      "NAME": "Химическая и нефтехимическая промышленность",
      "NAME_INIT": "",
      "SORT": "120",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "892",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:UC_U4LDDA",
      "NAME": "Кадровый резерв",
      "NAME_INIT": "",
      "SORT": "120",
      "SYSTEM": "N",
      "COLOR": "#47d1e2",
      "SEMANTICS": null,
      "CATEGORY_ID": "22"
    },
    {
      "ID": "918",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:UC_WOXNB7",
      "NAME": "На проверке",
      "NAME_INIT": "",
      "SORT": "120",
      "SYSTEM": "N",
      "COLOR": "#00c4fb",
      "SEMANTICS": null,
      "CATEGORY_ID": "24"
    },
    {
      "ID": "33",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "OTHER",
      "NAME": "Другое",
      "NAME_INIT": "",
      "SORT": "130",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "147",
      "ENTITY_ID": "INVOICE_STATUS",
      "STATUS_ID": "D",
      "NAME": "Не оплачен",
      "NAME_INIT": "Не оплачен",
      "SORT": "130",
      "SYSTEM": "Y",
      "COLOR": "#FF5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "0"
    },
    {
      "ID": "514",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:UC_CTZ527",
      "NAME": "Нет запроса",
      "NAME_INIT": "",
      "SORT": "130",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "554",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:WON",
      "NAME": "Заказ выполнен хорошо",
      "NAME_INIT": "Сделка успешна",
      "SORT": "130",
      "SYSTEM": "Y",
      "COLOR": "#7bd500",
      "SEMANTICS": "S",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "success",
        "COLOR": "#7bd500"
      }
    },
    {
      "ID": "622",
      "ENTITY_ID": "INDUSTRY",
      "STATUS_ID": "UC_WNMDWF",
      "NAME": "Энергетика и коммунальное хозяйство",
      "NAME_INIT": "",
      "SORT": "130",
      "SYSTEM": "N",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "870",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "130",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "22"
    },
    {
      "ID": "900",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:SUCCESS",
      "NAME": "Успех",
      "NAME_INIT": "Успех",
      "SORT": "130",
      "SYSTEM": "Y",
      "COLOR": "#00ff00",
      "SEMANTICS": "S",
      "CATEGORY_ID": "24"
    },
    {
      "ID": "494",
      "ENTITY_ID": "DEAL_STAGE_28",
      "STATUS_ID": "C28:APOLOGY",
      "NAME": "Не проходим по цене",
      "NAME_INIT": "",
      "SORT": "140",
      "SYSTEM": "N",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "28",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "556",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:LOSE",
      "NAME": "На удаление ( другие причины, комментарий обязателен)",
      "NAME_INIT": "Сделка провалена",
      "SORT": "140",
      "SYSTEM": "Y",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "failure",
        "COLOR": "#ff5752"
      }
    },
    {
      "ID": "752",
      "ENTITY_ID": "SOURCE",
      "STATUS_ID": "REPEAT_SALE",
      "NAME": "Повторные продажи",
      "NAME_INIT": "Повторные продажи",
      "SORT": "140",
      "SYSTEM": "Y",
      "COLOR": "#",
      "SEMANTICS": null,
      "CATEGORY_ID": "0"
    },
    {
      "ID": "872",
      "ENTITY_ID": "DYNAMIC_1058_STAGE_22",
      "STATUS_ID": "DT1058_22:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "140",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "22"
    },
    {
      "ID": "902",
      "ENTITY_ID": "DYNAMIC_1062_STAGE_24",
      "STATUS_ID": "DT1062_24:FAIL",
      "NAME": "Провал",
      "NAME_INIT": "Провал",
      "SORT": "140",
      "SYSTEM": "Y",
      "COLOR": "#ff0000",
      "SEMANTICS": "F",
      "CATEGORY_ID": "24"
    },
    {
      "ID": "672",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_NO6JZ4",
      "NAME": "КП Просрочено (поздно отправили)",
      "NAME_INIT": "",
      "SORT": "150",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "674",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_A1WGFY",
      "NAME": "Не успеваем по срокам ( изготовления деталей)",
      "NAME_INIT": "",
      "SORT": "160",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "660",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_0RERLS",
      "NAME": "Заказ отменён заказчиком",
      "NAME_INIT": "",
      "SORT": "170",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "624",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_RAVHYU",
      "NAME": "Не прошли по цене",
      "NAME_INIT": "",
      "SORT": "180",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "596",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:UC_0NH5K8",
      "NAME": "Нет технической возможности",
      "NAME_INIT": "",
      "SORT": "190",
      "SYSTEM": "N",
      "COLOR": "#f11716",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#f11716"
      }
    },
    {
      "ID": "558",
      "ENTITY_ID": "DEAL_STAGE_32",
      "STATUS_ID": "C32:APOLOGY",
      "NAME": "Малый объем заказа",
      "NAME_INIT": "",
      "SORT": "200",
      "SYSTEM": "N",
      "COLOR": "#ff5752",
      "SEMANTICS": "F",
      "CATEGORY_ID": "32",
      "EXTRA": {
        "SEMANTICS": "apology",
        "COLOR": "#ff5752"
      }
    }
  ],
  "total": 205,
  "time": {
    "start": 1788780588,
    "finish": 1788780588.154036,
    "duration": 0.1540360450744629,
    "processing": 0,
    "date_start": "2026-09-07T14:29:48+03:00",
    "date_finish": "2026-09-07T14:29:48+03:00",
    "operating_reset_at": 1788781188,
    "operating": 0
  }
}
```

### 6. Бизнес-процессы и Роботы

```js
https://grosver-group.bitrix24.by/rest/196/gutofeht542d642f/bizproc.workflow.template.list
```

```json
{
  "select": [
    "ID", "NAME", "DESCRIPTION", "AUTO_EXECUTE", 
    "TEMPLATE", "PARAMETERS", "VARIABLES", "CONSTANTS", "SYSTEM_CODE"
  ],
  "filter": {
    "DOCUMENT_TYPE": [
      "crm", 
      "Bitrix\\Crm\\Integration\\BizProc\\Document\\Dynamic", 
      "DYNAMIC_1062"
    ]
  }
}

{
  "result": [
    {
      "ID": "852",
      "NAME": "Отклонено / На доработку",
      "DESCRIPTION": "",
      "AUTO_EXECUTE": "3",
      "TEMPLATE": [
        {
          "Type": "SequentialWorkflowActivity",
          "Name": "Template",
          "Activated": "Y",
          "Node": null,
          "Properties": {
            "Title": "Последовательный бизнес-процесс",
            "Permission": []
          },
          "Children": [
            {
              "Type": "IfElseActivity",
              "Name": "A30895_16764_27061_91225",
              "Activated": "Y",
              "Node": null,
              "Properties": {
                "Title": "Условие"
              },
              "Children": [
                {
                  "Type": "IfElseBranchActivity",
                  "Name": "A9999_14943_52974_9215",
                  "Activated": "Y",
                  "Node": null,
                  "Properties": {
                    "Title": "Условие",
                    "EditorComment": "",
                    "fieldcondition": [
                      [
                        "UF_CRM_18_1788768850",
                        "=",
                        "7905f9a304641915c0cdddb32943db8a",
                        "0"
                      ]
                    ]
                  },
                  "Children": [
                    {
                      "Type": "SetFieldActivity",
                      "Name": "A48637_69223_90893_40889",
                      "Activated": "Y",
                      "Node": null,
                      "Properties": {
                        "FieldValue": {
                          "STAGE_ID": "{=Document:UF_CRM_18_1788509675_PRINTABLE}"
                        },
                        "ModifiedBy": [],
                        "MergeMultipleFields": "N",
                        "Title": "Изменение документа",
                        "EditorComment": ""
                      },
                      "Children": []
                    }
                  ]
                },
                {
                  "Type": "IfElseBranchActivity",
                  "Name": "A39544_33163_42391_6716",
                  "Activated": "Y",
                  "Node": null,
                  "Properties": {
                    "Title": "Условие"
                  },
                  "Children": []
                }
              ]
            }
          ]
        }
      ],
      "PARAMETERS": [],
      "VARIABLES": [],
      "CONSTANTS": [],
      "SYSTEM_CODE": null
    }
  ],
  "total": 1,
  "time": {
    "start": 1788780682,
    "finish": 1788780682.951738,
    "duration": 0.9517381191253662,
    "processing": 0,
    "date_start": "2026-09-07T14:31:22+03:00",
    "date_finish": "2026-09-07T14:31:22+03:00",
    "operating_reset_at": 1788781282,
    "operating": 0
  }
}
```


