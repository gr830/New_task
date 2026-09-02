# Сменная задание из SAP B1

**Как должно в принципе работать**
- Выбираем дату для анализа промежуток текущий месяц, смены 1 или 2 или все вместе, и версию таблицы плана (об этом подробнее далее) 
- И подгружаеться данные с нашей таблицы план, факт и прерывания в одну аналитическую таблицу.
- Все это нужно для своевременного анализа как мы планировали сработать и как по факту сработали.
- если например выбрали дату будущее но ничего мы просто выгрузим план а с табоицы факт и прерывания ничего не подтянеться не страшно.

**Как должна быть реализована таблица план**
- Таблица план береться с БД
- Она постоянно бежит вперед т.к. берет инфу из ганта. Поэтому анализ предыдущих дней сделать неполучиться из нее.
- Необходимо выгружать данные в ручную в разных промежутках времени в статичную таблицу которую мы и будим использовать для анализа всего этого.
- Например загрузили информацию в начале месяца. И потом добовляем данные напрмиер через неделю или даже каждывй день.
- Будим выгружать эти версии копировать все в этом промежутке до начало до конца текущего месяца что попадает просто писать длополнительно столбец дату выгрузки и номер версии. Версия сама должны учеличиваться при выгрузке.
- Типо в начале месяца выгрузили получили 400 строк, потом через неделю выгрузили уже получили 300 строк 2 версия, потмо уще например выгрузили через день получили 280 строк 3 версия и так далее, надеюсь понятно ход мысли.
- Пока сделать прсто запрос кторый будит в нашу статичную таблицу передовать новые данные.
- И также запрос на очищения всей таблицы или какой нибудь версии месяца.

Какие рамки задания у нас есть строгие правила по сменнам
- Надо поделить промежутки по сменнам строгим, сейчас у нас просто может цеплять разные смены но для аналитики нам нужен полный порядок чисел в заисемости от смены.
- Смена у нас такая 1 с 7.00 - до 19.00 вторая с 19,00 - 7,00. 
- Фишка такая что например у нас время дано 500 условнно минут которая затрагивает 2 смены мы должны вычеслить что к одной смене относиться а что ко второй и сколько типо сделали за одну часать деталей и сколько за вторую часть т.к. знаем т.шт. время, и также учитывать время наладки(надо минусовать).
- Время наладки в плане надо учитывать.

У меня это уже реализовано в принципе можно эту логику взять которая учитвает время наладки и делит смены, надо наверно тогда разораться с фактом как это все грамотно сопоставить с ним.

Тоесть по итогу что хотим добиться получить понятные данные что сколько планировали сделать за смену деталей и сколько сделали по итогу. Разобраться сколько прерывния времени отнимают. И вообще понять общею картину как мы планировали в моменте на всех стадиях и соспостовлятьс фактами и прерывпниями. Главное не ошибиться в цифрах анализа, ведь это будит основной отчет на который будит опираться все производство. Если будут несоответвия с нашей строныто и аналитика будит очень низкого качества.

## Базовый данные

```sql
USE [GROSVER_GROUP]
GO

/****** Object:  StoredProcedure [dbo].[GetPlanReportForExell]    Script Date: 14.08.2026 12:13:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- Создаем процедуру. Теперь эта команда идет первой в своем блоке благодаря GO выше.
ALTER PROCEDURE [dbo].[GetPlanReportForExell]
    @DaysAhead INT = 3 -- Входной параметр: количество дней вперед (по умолчанию 3)
AS
BEGIN
    -- Инструкция SET NOCOUNT ON добавлена для предотвращения отправки 
    -- лишних сообщений о количестве строк, чтобы не мешать Node.js серверу.
    SET NOCOUNT ON;

    -- НАЧАЛО ВАШЕГО ЗАПРОСА
    WITH PlanBase AS (
        SELECT 
            p.*,
            tp.ItemName,
            CAST(p.BELNR_ID AS INT) as int_BELNR_ID,
            CAST(p.BELPOS_ID AS INT) as int_BELPOS_ID,
            CAST(p.POS_ID AS INT) as int_POS_ID,
            ISNULL(p.TRAPLATZ, 0) AS safe_TRAPLATZ,
            ba.BEZ AS [Описание станка],
            -- Считаем сумму времени по ВСЕМ предыдущим строкам этой же операции
            ISNULL(SUM(p.Duration) OVER (
                PARTITION BY p.BELNR_ID, p.BELPOS_ID, p.POS_ID 
                ORDER BY p.VON 
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ), 0) AS Prev_Rows_Duration
        FROM [GROSVER_GROUP].[dbo].[GC_PLAN_FINANCIAL_REPORT] p
        LEFT JOIN [dbo].[BEAS_FTPOS] tp ON CAST(p.BELNR_ID AS INT) = tp.BELNR_ID 
                                        AND CAST(p.BELPOS_ID AS INT) = tp.BELPOS_ID
        LEFT JOIN [dbo].[BEAS_FTAPL] tl ON CAST(p.BELNR_ID AS INT) = tl.BELNR_ID 
                                        AND CAST(p.BELPOS_ID AS INT) = tl.BELPOS_ID and p.POS_ID = tl.POS_ID
        LEFT JOIN [dbo].[BEAS_APLATZ] ba ON p.[RESOURCE] = ba.APLATZ_ID
        -- Фильтр: от сегодняшнего дня до сегодняшнего дня + @DaysAhead дней
        WHERE CAST(p.VON AS DATE) >= CAST(GETDATE() AS DATE) 
          AND CAST(p.VON AS DATE) <= CAST(DATEADD(DAY, @DaysAhead, GETDATE()) AS DATE) 
          AND tl.ABGKZ <> 'J'
    ),

    LocalStatus AS (
        SELECT 
            CAST(BELNR_ID AS INT) as BELNR_ID, 
            CAST(BELPOS_ID AS INT) as BELPOS_ID, 
            CAST(POS_ID AS INT) as POS_ID,
            MAX(CASE WHEN TYP = 'A' THEN 1 ELSE 0 END) AS HasProcessing,
            MAX(CASE WHEN TYP = 'R' AND ZEIT > 0 THEN 1 ELSE 0 END) AS HasSetup,
            SUM(ISNULL(MENGE_GUT, 0)) AS SumMengeGut
        FROM [dbo].[BEAS_ARBZEIT]
        GROUP BY BELNR_ID, BELPOS_ID, POS_ID
    ),

    GlobalSetupLookup AS (
        SELECT 
            tp.ItemName,
            az.POS_ID,
            az.APLATZ_ID, 
            1 AS HasGlobalSetup
        FROM [dbo].[BEAS_ARBZEIT] az
        INNER JOIN [dbo].[BEAS_FTPOS] tp ON az.BELNR_ID = tp.BELNR_ID AND az.BELPOS_ID = tp.BELPOS_ID
        INNER JOIN [dbo].[BEAS_FTHAUPT] fh ON tp.BELNR_ID = fh.BELNR_ID
        WHERE tp.ABGKZ = 'N' AND fh.ABGKZ = 'N' 
          AND az.TYP = 'R' AND az.ZEIT > 0 
        GROUP BY tp.ItemName, az.POS_ID, az.APLATZ_ID
    ),

    ExtendedPlan AS (
        SELECT 
            p.*,
            CASE WHEN ls.HasProcessing = 1 OR ls.HasSetup = 1 OR gs.HasGlobalSetup = 1 THEN 0 ELSE 1 END AS Is_Setup_Needed,
            CASE WHEN ls.HasProcessing = 1 THEN N'Да (Идет обработка)'
                 WHEN ls.HasSetup = 1 THEN N'Да (Наладка по позиции)'
                 WHEN gs.HasGlobalSetup = 1 THEN N'Да (Наладка в др. документе)'
                 ELSE N'Нет' END AS Setup_Done_Text,
            ISNULL(ls.SumMengeGut, 0) AS SumMengeGut,
            apl.TEAPLATZ AS apl_TEAPLATZ,
            apl.gc_intensity_fact
        FROM PlanBase p
        LEFT JOIN [dbo].[BEAS_FTAPL] apl ON p.int_BELNR_ID = apl.BELNR_ID AND p.int_BELPOS_ID = apl.BELPOS_ID AND p.int_POS_ID = apl.POS_ID
        LEFT JOIN LocalStatus ls ON p.int_BELNR_ID = ls.BELNR_ID AND p.int_BELPOS_ID = ls.BELPOS_ID AND p.int_POS_ID = ls.POS_ID
        LEFT JOIN GlobalSetupLookup gs ON p.ItemName = gs.ItemName AND p.int_POS_ID = gs.POS_ID AND p.[RESOURCE] = gs.APLATZ_ID
    )

    SELECT 
        ep.PRIOR_ID,
        ep.ItemCode,
        ep.ItemName,
        ep.BELNR_ID,
        ep.BELPOS_ID,
        ep.POS_ID,
        ep.[RESOURCE],
        ep.[Описание станка],
        
        CASE WHEN DATEPART(HOUR, sh.ShiftStart) = 7 THEN N'1 смена ' ELSE N'2 смена ' END + 
        CONVERT(VARCHAR(10), CAST(sh.ShiftStart AS DATE), 104) AS [Shift],
        
        -- УМНАЯ НАЛАДКА: опирается на сквозной расчет по всем строкам одной операции
        CASE 
            WHEN ep.Is_Setup_Needed = 0 THEN ep.Setup_Done_Text
            WHEN setup.Setup_In_Slice > 0 THEN N'Нет (наладка ' + CAST(setup.Setup_In_Slice AS NVARCHAR) + N' мин)'
            ELSE N'Нет (наладка завершена)'
        END AS [Setup_Done],

        ep.VERURSACHER_AGBEZ,
        
        slice.Part_VON AS [VON],
        slice.Part_BIS AS [BIS],
        splits.Part_Duration AS [Duration],
        ep.MENGE,

        CAST(
            (splits.Part_Duration - setup.Setup_In_Slice) / NULLIF(ep.apl_TEAPLATZ, 0)
        AS DECIMAL(18,2)) AS Plan_Qty_Details,

        ep.TEAPLATZ,
        ep.TRAPLATZ,
        ep.gc_intensity_fact,
        ep.apl_TEAPLATZ AS TEAPLATZ_ALT,
        
        (ep.MENGE - ep.SumMengeGut) AS Remainder_Order,
        ep.Price_for_1_min_V2 as Price_for_1_min,
        
        CAST(
            ep.Narabotka_plan * (CAST(splits.Part_Duration AS FLOAT) / NULLIF(ep.Duration, 0))
        AS DECIMAL(18,2)) AS Narabotka_plan,
        
        ep.Date

    FROM ExtendedPlan ep

    -- 1. Смещение на 7 часов для генератора смен
    CROSS APPLY (
        SELECT DATEADD(HOUR, -7, ep.VON) AS OffsetVON
    ) o
    CROSS APPLY (
        SELECT DATEADD(HOUR, CASE WHEN DATEPART(HOUR, o.OffsetVON) < 12 THEN 7 ELSE 19 END, CAST(CAST(o.OffsetVON AS DATE) AS DATETIME)) AS FirstShiftStart
    ) fs

    -- 2. Генерируем только нужные смены
    INNER JOIN (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20)) nums(n)
        ON DATEADD(HOUR, nums.n * 12, fs.FirstShiftStart) < ep.BIS

    -- 3. Вычисляем границы смены
    CROSS APPLY (
        SELECT 
            DATEADD(HOUR, nums.n * 12, fs.FirstShiftStart) AS ShiftStart,
            DATEADD(HOUR, (nums.n + 1) * 12, fs.FirstShiftStart) AS ShiftEnd
    ) sh

    -- 4. Режем операцию по сменам
    CROSS APPLY (
        SELECT 
            CASE WHEN ep.VON > sh.ShiftStart THEN ep.VON ELSE sh.ShiftStart END AS Part_VON,
            CASE WHEN ep.BIS < sh.ShiftEnd THEN ep.BIS ELSE sh.ShiftEnd END AS Part_BIS
    ) slice

    -- 5. Считаем длительность и локальное время ДО текущего куска
    CROSS APPLY (
        SELECT 
            DATEDIFF(MINUTE, slice.Part_VON, slice.Part_BIS) AS Part_Duration,
            DATEDIFF(MINUTE, ep.VON, slice.Part_VON) AS Time_Before_In_Row
    ) splits

    -- 6. КРИТИЧНОЕ ИСПРАВЛЕНИЕ: Суммируем время из прошлых строк плана + время в текущей строке плана
    CROSS APPLY (
        SELECT ep.Prev_Rows_Duration + splits.Time_Before_In_Row AS Total_Time_Before
    ) t_before

    -- 7. Расчет наладки на основе ГЛОБАЛЬНОГО времени (Total_Time_Before)
    CROSS APPLY (
        SELECT 
            CASE 
                WHEN ep.Is_Setup_Needed = 0 THEN 0
                WHEN (ep.safe_TRAPLATZ - t_before.Total_Time_Before) <= 0 THEN 0 -- Вся наладка уже пройдена в прошлых сменах или прошлых строках!
                WHEN (ep.safe_TRAPLATZ - t_before.Total_Time_Before) > splits.Part_Duration THEN splits.Part_Duration -- Вся текущая смена уходит на наладку
                ELSE (ep.safe_TRAPLATZ - t_before.Total_Time_Before) -- Остаток наладки перекрывается в этой смене
            END AS Setup_In_Slice
    ) setup

    WHERE splits.Part_Duration > 0 

    ORDER BY sh.ShiftStart, ep.VON, ep.PRIOR_ID;
END

GO

exec [dbo].[GetPlanReportForExell]
```

PRIOR_ID	ItemCode	ItemName	BELNR_ID	BELPOS_ID	POS_ID	RESOURCE	Описание станка	Shift	Setup_Done	VERURSACHER_AGBEZ	VON	BIS	Duration	MENGE	Plan_Qty_Details	TEAPLATZ	TRAPLATZ	gc_intensity_fact	TEAPLATZ_ALT	Remainder_Order	Price_for_1_min	Narabotka_plan	Date
1-Hi                	21010008379	Заготовка "Втулка ЕКВД.713541.011"БП	5263	30	30	L04                           	TWIN 42 № 2	2 смена 13.08.2026	Да (Идет обработка)	30 Токарная операция с ЧПУ	2026-08-14 01:12:00.000	2026-08-14 06:59:59.000	347	3060	35.41	6,6	320	0.310000	9.800000	2330	1,66148890348725	576.54	2026-08-13
1-Hi                	43010008223	Крышка СНРД753312.004	5282	130	20	L01                           	Weiler DZ67	2 смена 13.08.2026	Да (Идет обработка)	20 Токарная операция с ЧПУ	2026-08-14 01:12:00.000	2026-08-14 06:59:59.000	347	45	37.19	9,3	70	0.160000	9.330000	18	2,44771481752113	849.36	2026-08-13
1-Hi                	43010008223	Крышка СНРД753312.004	5282	130	20	L01                           	Weiler DZ67	1 смена 14.08.2026	Да (Идет обработка)	20 Токарная операция с ЧПУ	2026-08-14 07:00:00.000	2026-08-14 09:06:00.000	126	45	13.50	9,3	70	0.160000	9.330000	18	2,44771481752113	308.41	2026-08-14
1-Hi                	21010008379	Заготовка "Втулка ЕКВД.713541.011"БП	5263	30	30	L04                           	TWIN 42 № 2	1 смена 14.08.2026	Да (Идет обработка)	30 Токарная операция с ЧПУ	2026-08-14 07:00:00.000	2026-08-14 19:00:00.000	720	3060	73.47	6,6	320	0.310000	9.800000	2330	1,66148890348725	1196.27	2026-08-14
1-Hi                	43010008401	Корпус М311-1М.01.02.119	5291	40	20	M05                           	DMU Eco/S	1 смена 14.08.2026	Нет (наладка 180 мин)	20 Фрезерная операция с ЧПУ (3+2)	2026-08-14 08:12:00.000	2026-08-14 19:00:00.000	648	215	39.00	12	180	NULL	12.000000	215	2,3951146042641	1552.03	2026-08-14

### Отчет план

```sql
/****** Скрипт для команды SelectTopNRows из среды SSMS  ******/
SELECT [PRIOR_ID]
      ,[Date]
      ,[BELNR_ID]
      ,[BELPOS_ID]
      ,[POS_ID]
      ,[VON]
      ,[BIS]
      ,[Duration]
      ,[RESOURCE]
      ,[VERURSACHER_AGBEZ]
      ,[ItemCode]
      ,[Autsorsing]
      ,[Code_material]
      ,[MENGE]
      ,[Norma_v_kg]
      ,[Price_for_1_min]
      ,[Price_for_1_min_V2]
      ,[Srednyaya_tsena_materiala]
      ,[TEAPLATZ]
      ,[TRAPLATZ]
      ,[Unit_price]
      ,[Stoim_materiala]
      ,[Narabotka_plan]
      ,[Narabotka_plan2]
  FROM [GROSVER_GROUP].[dbo].[GC_PLAN_FINANCIAL_REPORT]
  WHERE Date BETWEEN '2026-08-01' AND '2026-08-31'
```

PRIOR_ID	Date	BELNR_ID	BELPOS_ID	POS_ID	VON	BIS	Duration	RESOURCE	VERURSACHER_AGBEZ	ItemCode	Autsorsing	Code_material	MENGE	Norma_v_kg	Price_for_1_min	Price_for_1_min_V2	Srednyaya_tsena_materiala	TEAPLATZ	TRAPLATZ	Unit_price	Stoim_materiala	Narabotka_plan	Narabotka_plan2
1-Hi                	2026-08-13	5104	140	20	2026-08-14 01:12:00.000	2026-08-14 06:59:59.000	347	L09                           	20 Токарная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	6	150	45,8015184381779	0	373,59174996474	428,716328408478
1-Hi                	2026-08-14	5104	140	20	2026-08-14 07:00:00.000	2026-08-14 21:15:00.000	855	L09                           	20 Токарная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	6	150	45,8015184381779	0	920,521458846838	1056,34714924855
1-Hi                	2026-08-13	5104	140	30	2026-08-14 03:36:00.000	2026-08-14 06:59:59.000	203	L10                           	30 Токарная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	4,2	180	45,8015184381779	0	218,556556895799	250,805229587669
1-Hi                	2026-08-14	5104	140	30	2026-08-14 07:00:00.000	2026-08-14 18:45:00.000	705	L10                           	30 Токарная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	4,2	180	45,8015184381779	0	759,026466066691	871,023087976879
1-Hi                	2026-08-14	5104	140	40	2026-08-15 01:12:00.000	2026-08-15 06:59:59.000	347	M03                           	40 Фрезерная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	8,5	300	45,8015184381779	0	373,59174996474	428,716328408478
1-Hi                	2026-08-15	5104	140	40	2026-08-16 01:12:00.000	2026-08-16 06:59:59.000	347	M03                           	40 Фрезерная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	8,5	300	45,8015184381779	0	373,59174996474	428,716328408478
1-Hi                	2026-08-16	5104	140	40	2026-08-17 01:12:00.000	2026-08-17 06:59:59.000	347	M03                           	40 Фрезерная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	8,5	300	45,8015184381779	0	373,59174996474	428,716328408478
1-Hi                	2026-08-15	5104	140	40	2026-08-15 07:00:00.000	2026-08-15 22:47:00.000	947	M03                           	40 Фрезерная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	8,5	300	45,8015184381779	0	1019,57172108533	1170,01257349518
1-Hi                	2026-08-16	5104	140	40	2026-08-16 07:00:00.000	2026-08-16 22:47:00.000	947	M03                           	40 Фрезерная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	8,5	300	45,8015184381779	0	1019,57172108533	1170,01257349518
1-Hi                	2026-08-17	5104	140	40	2026-08-17 07:00:00.000	2026-08-17 20:37:00.000	817	M03                           	40 Фрезерная операция с ЧПУ	21010008317	0	NULL	350	0	1,23549374181118	1,07663328520098	0	8,5	300	45,8015184381779	0	879,609394009201	1009,39838705973

### Отчет факт

```sql
SELECT TOP (1000) [Start Time]
      ,[End Time]
      ,[ANFZEIT]
      ,[ENDZEIT]
      ,[APLATZ_ID]
      ,[BELNR_ID]
      ,[BELPOS_ID]
      ,[POS_ID]
      ,[POS_TEXT]
      ,[TYP]
      ,[ItemCode]
      ,[T_obr_plan]
      ,[T_nal_plan]
      ,[Norma]
      ,[BUCHNR_ID]
      ,[DisplayName]
      ,[Kol_detalej]
      ,[ZEIT]
      ,[DocEntry]
      ,[Unit_price]
      ,[Code_material]
      ,[Spisano_materiala]
      ,[Norma_v_kg]
      ,[Srednyaya_tsena_materiala]
      ,[Autsorsing]
      ,[BEZ]
      ,[MENGE]
      ,[MENGE_WITHOUT_SETUP]
      ,[Total_time_for_operation]
      ,[Total_time_for_operation_V2]
      ,[Total_time_for_detail]
      ,[Total_time_for_detail_V2]
      ,[TRAPLATZ]
      ,[TEAPLATZ]
      ,[Price_without_mater_and_autsors]
      ,[Price_for_1_min]
      ,[Price_for_1_min_V2]
      ,[planned_util]
      ,[fact_util]
      ,[WorkCost]
      ,[Fact_narabotka]
      ,[Plan_narabotka]
      ,[Shift]
      ,[Date]
  FROM [GROSVER_GROUP].[dbo].[GC_FACT_FINANCIAL_REPORT]
  WHERE Date BETWEEN '2026-08-01' AND '2026-08-31'
```

Start Time	End Time	ANFZEIT	ENDZEIT	APLATZ_ID	BELNR_ID	BELPOS_ID	POS_ID	POS_TEXT	TYP	ItemCode	T_obr_plan	T_nal_plan	Norma	BUCHNR_ID	DisplayName	Kol_detalej	ZEIT	DocEntry	Unit_price	Code_material	Spisano_materiala	Norma_v_kg	Srednyaya_tsena_materiala	Autsorsing	BEZ	MENGE	MENGE_WITHOUT_SETUP	Total_time_for_operation	Total_time_for_operation_V2	Total_time_for_detail	Total_time_for_detail_V2	TRAPLATZ	TEAPLATZ	Price_without_mater_and_autsors	Price_for_1_min	Price_for_1_min_V2	planned_util	fact_util	WorkCost	Fact_narabotka	Plan_narabotka	Shift	Date
07:01:00.0000000	07:32:00.0000000	2026-08-01 07:01:00.000	2026-08-01 07:32:00.000	M13                 	5103	90	100	50	A	21010008319	7.60000000000	0.000000	1.900000	329682	Присяжный А.С.	4.000000	31.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	15,5610597313621	62,2442389254483	1	2026-08-01
07:52:00.0000000	09:18:00.0000000	2026-08-01 07:52:00.000	2026-08-01 09:18:00.000	M13                 	5103	90	100	50	A	21010008319	68.40000000000	0.000000	1.900000	329688	Веселов Е.В.	36.000000	86.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	140,049537582259	175,061921977823	1	2026-08-01
09:24:00.0000000	10:13:00.0000000	2026-08-01 09:24:00.000	2026-08-01 10:13:00.000	M13                 	5103	90	100	50	A	21010008319	45.60000000000	0.000000	1.900000	329696	Веселов Е.В.	24.000000	49.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	93,3663583881724	97,2566233210129	1	2026-08-01
10:19:00.0000000	12:34:00.0000000	2026-08-01 10:19:00.000	2026-08-01 12:34:00.000	M13                 	5103	90	100	50	A	21010008319	76.00000000000	0.000000	1.900000	329702	Веселов Е.В.	40.000000	135.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	155,610597313621	276,208810231677	1	2026-08-01
12:35:00.0000000	13:08:00.0000000	2026-08-01 12:35:00.000	2026-08-01 13:08:00.000	M13                 	5103	90	100	50	A	21010008319	22.80000000000	0.000000	1.900000	329705	Веселов Е.В.	12.000000	33.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	46,6831791940862	66,1345038582888	1	2026-08-01
13:09:00.0000000	14:26:00.0000000	2026-08-01 13:09:00.000	2026-08-01 14:26:00.000	M13                 	5103	90	100	50	A	21010008319	64.60000000000	0.000000	1.900000	329712	Веселов Е.В.	34.000000	77.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	132,269007716578	155,610597313621	1	2026-08-01
14:27:00.0000000	15:46:00.0000000	2026-08-01 14:27:00.000	2026-08-01 15:46:00.000	M13                 	5103	90	100	50	A	21010008319	38.00000000000	0.000000	1.900000	329720	Веселов Е.В.	20.000000	79.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	77,8052986568103	159,500862246461	1	2026-08-01
17:23:00.0000000	18:44:00.0000000	2026-08-01 17:23:00.000	2026-08-01 18:44:00.000	M13                 	5103	90	100	50	A	21010008319	49.40000000000	0.000000	1.900000	329731	Веселов Е.В.	26.000000	81.000000	1683	56.6002391304347826086	00030001282	NULL	0.0866250858695652173	1200.000000	0	GROSVER V856	920.000000	920.000000	2940	1928	22672	25432	180.000000	3	56,600239	2,29676340331687	2,04750785938975	NULL	NULL	3,89026493284052	101,146888253853	163,391127179302	1	2026-08-01

### Прерывание

```sql
DECLARE @YearStart DATE = CAST(CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-01-01' AS DATE);

select 
SUM(t0.Koeff_poter) OVER (Partition BY t0.Дата, t0.смена ORDER BY t0.Дата, t0.смена) AS window_function, 
*

from
(
select 
 
--datediff(mi, t1.ANFZEIT, t1.ENDZEIT),
datediff(mi, t0.DATUM_VON, (case when t0.DATUM_BIS <= GETDATE() then t0.DATUM_BIS else GETDATE() end)) as 'Продолжительность_2',
case when t0.DATUM_BIS <= GETDATE() then 'N' else 'Y' end as 'Active_interruption',


t0.APLATZ_ID, 
t10.DATUM_VON, 
case when t10.DATUM_BIS <= GETDATE() then t10.DATUM_BIS else GETDATE() end as 'End_Date',
t10.DATUM_BIS, 
t0.INTNR as 'INTNR@UF:UF-005', 
t0.GRUNDID,
t6.GRUNDINFO as 'Стандарт_наименование_прерывания', 
t0.GRUNDINFO, 
t0.PERS_ID_Name, 
t0.PERS_ID_END_Name, 
t0.UDF1 as 'Подпричина прер.', 
t0.UDF2 as 'Подпричина подприч. прер.', 
datediff(mi, t10.DATUM_VON, (case when t10.DATUM_BIS <= GETDATE() then t10.DATUM_BIS else GETDATE() end)) as 'Продолжительность, мин', 
t2.ItemCode, case when t2.ItemCode like '2101%' then '4301'+substring(t2.ItemCode, 5,7) else t2.ItemCode end as 'ItemCode_GP',
t3.U_RESP_USER,
t4.KND_ID, 
t4.KNDNAME,
t5.bez,

--присваивание смены
		case 
		when cast(t10.DATUM_VON as time) >= '07:00:00' and cast(t10.DATUM_VON as time) < '19:00:00'
		then 1 
		else 2 
	END AS 'Смена',

--Дата
		case when 
			--если первая смена
			(case when cast(t10.DATUM_VON as time) >= '07:00:00' and cast(t10.DATUM_VON as time) < '19:00:00' then 1 else 2 END)=1 then cast(t10.DATUM_VON as date)
			 --если вторая смена
			 when cast(t10.DATUM_VON as time) between '19:00:00.0000000' and '23:59:59.0000000' then cast(t10.DATUM_VON as date)
			 else cast(DATEADD(day, -1, t10.DATUM_VON) as date)
		end as 'Дата',



cast(datediff(mi, t10.DATUM_VON, (case when t10.DATUM_BIS <= GETDATE() then t10.DATUM_BIS else GETDATE() end)) as float)/
	(
	--кол-во активных станков
	(SELECT count(APLATZ_ID) 
	 FROM BEAS_APLATZ 
	 where Active = 'J' and GRUPPE in ('Lathes', 'Milling') and APLATZ_ID not in ('L02','L05','L08', 'L11', 'M04', 'M08','Mill','Turning')
			)*12*60) as 'Koeff_poter',
t1.BUCHNR_ID, 
t1.ANFZEIT, 
t1.ENDZEIT, 
t1.ZEIT, 
t1.BELNR_ID, 
t1.BELPOS_ID, 
t1.POS_ID

from GC_APLATZ_STILLSTAND_BY_SHIFT t10
left join BEAS_APLATZ_STILLSTAND t0 on t10.INTNR=t0.INTNR and t10.APLATZ_ID=t0.APLATZ_ID
left join beas_arbzeit t1 ON t1.APLATZ_ID=t0.APLATZ_ID and t0.DATUM_VON between t1.ANFZEIT and t1.ENDZEIT

left join BEAS_FTPOS t2 ON t2.BELNR_ID=t1.BELNR_ID and t2.BELPOS_ID=t1.BELPOS_ID 
left join OITM t3 ON t3.ItemCode=(case when t2.ItemCode like '2101%' then '4301'+substring(t2.ItemCode, 5,7) else t2.ItemCode end)
left join BEAS_FTHAUPT t4 ON t4.BELNR_ID=t1.BELNR_ID
left join BEAS_APLATZ t5 on t5.APLATZ_ID=t0.APLATZ_ID
left join BEAS_STILLSTANDGRUND t6 ON t6.GRUNDID=t0.GRUNDID


where t10.DATUM_VON>= @YearStart and t10.DATUM_VON<t10.DATUM_BIS
and t10.APLATZ_ID in (SELECT APLATZ_ID FROM BEAS_APLATZ where Active = 'J' and GRUPPE in ('Lathes', 'Milling') and (APLATZ_ID not in ('L02', 'L05', 'L08', 'L11', 'M04', 'M08', 'Mill', 'Turning')))

) t0


where t0.DATUM_VON<t0.End_Date

order by t0.Дата desc, t0.Смена desc
```

window_function	Продолжительность_2	Active_interruption	APLATZ_ID	DATUM_VON	End_Date	DATUM_BIS	INTNR@UF:UF-005	GRUNDID	Стандарт_наименование_прерывания	GRUNDINFO	PERS_ID_Name	PERS_ID_END_Name	Подпричина прер.	Подпричина подприч. прер.	Продолжительность, мин	ItemCode	ItemCode_GP	U_RESP_USER	KND_ID	KNDNAME	bez	Смена	Дата	Koeff_poter	BUCHNR_ID	ANFZEIT	ENDZEIT	ZEIT	BELNR_ID	BELPOS_ID	POS_ID
0,220052083333333	221887	Y	L03                 	2026-08-14 07:00:00.000	2026-08-14 11:29:33.247	2026-08-14 19:00:00.000	82100	S01                 	Поломка оборудования	Поломка оборудования ( не крутит револьверную голову )	Соколов В.Н.	NULL			269	NULL	NULL	NULL	NULL	NULL	Hwacheon Cutex 160	1	2026-08-14	0,0233506944444444	NULL	NULL	NULL	NULL	NULL	NULL	NULL
0,220052083333333	12	N	M12                 	2026-08-14 07:00:00.000	2026-08-14 07:06:08.327	2026-08-14 07:06:08.327	88442	S24                 	Передача смены	Передача смены	Тимофеев Р.В.	Сузодольский К.Д.			6	NULL	NULL	NULL	NULL	NULL	DMU 40 monoBLOCK	1	2026-08-14	0,000520833333333333	NULL	NULL	NULL	NULL	NULL	NULL	NULL
0,220052083333333	4	N	M12                 	2026-08-14 09:39:05.000	2026-08-14 09:43:52.130	2026-08-14 09:43:52.130	88450	S24                 	Передача смены	Передача смены	Сузодольский К.Д.	Арцукевич К.			4	NULL	NULL	NULL	NULL	NULL	DMU 40 monoBLOCK	1	2026-08-14	0,000347222222222222	NULL	NULL	NULL	NULL	NULL	NULL	NULL
0,220052083333333	16	N	M13                 	2026-08-14 07:00:00.000	2026-08-14 07:05:46.737	2026-08-14 07:05:46.737	88437	S24                 	Передача смены	Передача смены	Альховский А.Ю.	Сузодольский К.Д.			5	NULL	NULL	NULL	NULL	NULL	GROSVER V856	1	2026-08-14	0,000434027777777778	NULL	NULL	NULL	NULL	NULL	NULL	NULL
0,220052083333333	23	N	M05                 	2026-08-14 07:00:00.000	2026-08-14 07:15:23.820	2026-08-14 07:15:23.820	88440	S24                 	Передача смены	Передача смены	Бовсун Е.А.	Клишанец Д.С.			15	NULL	NULL	NULL	NULL	NULL	DMU Eco/S	1	2026-08-14	0,00130208333333333	NULL	NULL	NULL	NULL	NULL	NULL	NULL
0,220052083333333	141	Y	M05                 	2026-08-14 09:08:57.000	2026-08-14 11:29:33.247	2026-08-14 19:00:00.000	88449	S18                 	Другие причины простоя	Доработка оснастки дет.8401	Клишанец Д.С.	NULL			141	NULL	NULL	NULL	NULL	NULL	DMU Eco/S	1	2026-08-14	0,0122395833333333	NULL	NULL	NULL	NULL	NULL	NULL	NULL
0,220052083333333	218	Y	M07                 	2026-08-14 07:51:55.000	2026-08-14 11:29:33.247	2026-08-14 19:00:00.000	88446	S09                 	Отсутствие мерительного инструмента 	Отсутствие мерительного инструмента, резьбовой калибр М8, спец калибр	Арцукевич К.	NULL			218	NULL	NULL	NULL	NULL	NULL	CHIRON FZ15KS-2	1	2026-08-14	0,0189236111111111	NULL	NULL	NULL	NULL	NULL	NULL	NULL


# 🚀 Полная документация: Производственный Дашборд (SAP B1 -> Google Sheets)


## Часть 1. База данных (SQL Server)

### 1.1. Статичная таблица для Снапшотов Плана (`GC_PLAN_SNAPSHOT`)

Таблица сохраняет «замороженные» версии плана из диаграммы Ганта, чтобы предотвратить их постоянное смещение в будущее при анализе прошлых периодов.

```sql
USE [GROSVER_GROUP]
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GC_PLAN_SNAPSHOT]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[GC_PLAN_SNAPSHOT] (
        [Snapshot_ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Upload_Date] DATETIME NOT NULL,     
        [Report_Month] DATE NOT NULL,        
        [Version_Num] INT NOT NULL,          
        [PRIOR_ID] NVARCHAR(50),
        [ItemCode] NVARCHAR(50),
        [ItemName] NVARCHAR(255),
        [BELNR_ID] INT,
        [BELPOS_ID] INT,
        [POS_ID] INT,
        [RESOURCE] NVARCHAR(50),
        [Описание станка] NVARCHAR(255),
        [Shift] NVARCHAR(100),
        [Setup_Done] NVARCHAR(100),
        [VERURSACHER_AGBEZ] NVARCHAR(255),
        [VON] DATETIME,
        [BIS] DATETIME,
        [Duration] FLOAT,
        [MENGE] FLOAT,
        [Plan_Qty_Details] FLOAT,
        [TEAPLATZ] FLOAT,
        [TRAPLATZ] FLOAT,
        [gc_intensity_fact] FLOAT,
        [TEAPLATZ_ALT] FLOAT,
        [Remainder_Order] FLOAT,
        [Price_for_1_min] FLOAT,
        [Narabotka_plan] FLOAT,
        [Date] DATE
    )
END
GO
```

### 1.2. Представление объединения: План + Факт + Простой (`VW_PRODUCTION_ANALYTICS`)
Главное аналитическое ядро. Очищает пробелы (через `RTRIM(LTRIM)`), подтягивает заказы к прерываниям и приводит данные к единой структуре из 14 колонок.

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.VW_PRODUCTION_ANALYTICS', 'V') IS NOT NULL
    DROP VIEW dbo.VW_PRODUCTION_ANALYTICS;
GO

CREATE VIEW [dbo].[VW_PRODUCTION_ANALYTICS] AS

-- ==========================
-- 1. СРЕЗ: ПЛАН 
-- ==========================
SELECT 
    N'План' AS [Тип Данных],
    CONVERT(DATE, RIGHT(RTRIM(p.[Shift]), 10), 104) AS [Дата],
    CAST(LEFT(RTRIM(p.[Shift]), 1) AS INT) AS [Смена],
    RTRIM(LTRIM(p.RESOURCE)) AS [Станок],
    RTRIM(LTRIM(CAST(p.BELNR_ID AS NVARCHAR(50)))) AS [Заказ],
    RTRIM(LTRIM(CAST(p.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(p.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(p.ItemCode)) AS [Артикул],
    p.[Version_Num] AS [Версия_Плана],
    p.Plan_Qty_Details AS [План_Шт],
    p.Duration AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_PLAN_SNAPSHOT] p

UNION ALL

-- ==========================
-- 2. СРЕЗ: ФАКТ
-- ==========================
SELECT 
    CASE WHEN f.Kol_detalej < 0 THEN N'Факт (Брак/Сторно)' ELSE N'Факт' END AS [Тип Данных],
    f.Date AS [Дата],
    CAST(f.[Shift] AS INT) AS [Смена],
    RTRIM(LTRIM(f.APLATZ_ID)) AS [Станок],
    RTRIM(LTRIM(CAST(f.BELNR_ID AS NVARCHAR(50)))) AS [Заказ],
    RTRIM(LTRIM(CAST(f.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(f.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(f.ItemCode)) AS [Артикул],
    0 AS [Версия_Плана],
    0, 0,
    CASE WHEN f.Kol_detalej > 0 THEN f.Kol_detalej ELSE 0 END AS [Факт_Шт],
    CASE WHEN f.[End Time] >= f.[Start Time] THEN DATEDIFF(MINUTE, f.[Start Time], f.[End Time]) ELSE 0 END AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_FACT_FINANCIAL_REPORT] f
WHERE f.[Start Time] IS NOT NULL AND f.[End Time] IS NOT NULL

UNION ALL

-- ==========================
-- 3. СРЕЗ: ПРЕРЫВАНИЯ
-- ==========================
SELECT 
    N'Прерывание' AS [Тип Данных],
    i.Дата AS [Дата],
    CAST(i.Смена AS INT) AS [Смена],
    RTRIM(LTRIM(i.APLATZ_ID)) AS [Станок],
    ISNULL(RTRIM(LTRIM(CAST(i.BELNR_ID AS NVARCHAR(50)))), N'Вне заказа') AS [Заказ],
    ISNULL(RTRIM(LTRIM(CAST(i.BELPOS_ID AS NVARCHAR(50)))), N'-') AS [Позиция],
    ISNULL(RTRIM(LTRIM(CAST(i.POS_ID AS NVARCHAR(50)))), N'-') AS [Операция],
    ISNULL(RTRIM(LTRIM(i.ItemCode)), N'Общий простой станка') AS [Артикул],
    0 AS [Версия_Плана],
    0, 0, 0, 0,
    i.[Продолжительность, мин] AS [Прерывания_Мин]
FROM (
    SELECT t0.*
    FROM (
        SELECT 
            t0.APLATZ_ID, t10.DATUM_VON, 
            CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END AS End_Date,
            t10.DATUM_BIS, t0.INTNR, t0.GRUNDID, t6.GRUNDINFO AS Стандарт_наименование_прерывания, 
            t0.GRUNDINFO, t0.PERS_ID_Name, t0.PERS_ID_END_Name, t0.UDF1, t0.UDF2,
            DATEDIFF(mi, t10.DATUM_VON, (CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END)) AS [Продолжительность, мин],
            t2.ItemCode, 
            t3.U_RESP_USER, t4.KND_ID, t4.KNDNAME, t5.bez,
            CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END AS Смена,
            CASE 
                WHEN (CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END) = 1 THEN CAST(t10.DATUM_VON AS DATE)
                WHEN CAST(t10.DATUM_VON AS TIME) BETWEEN '19:00:00.0000000' AND '23:59:59.0000000' THEN CAST(t10.DATUM_VON AS DATE)
                ELSE CAST(DATEADD(day, -1, t10.DATUM_VON) AS DATE)
            END AS Дата,
            t1.BUCHNR_ID, t1.ANFZEIT, t1.ENDZEIT, t1.ZEIT, t1.BELNR_ID, t1.BELPOS_ID, t1.POS_ID
        FROM GC_APLATZ_STILLSTAND_BY_SHIFT t10
        LEFT JOIN BEAS_APLATZ_STILLSTAND t0 ON t10.INTNR = t0.INTNR AND t10.APLATZ_ID = t0.APLATZ_ID
        LEFT JOIN beas_arbzeit t1 ON t1.APLATZ_ID = t0.APLATZ_ID AND t0.DATUM_VON >= t1.ANFZEIT AND t0.DATUM_VON < t1.ENDZEIT 
        LEFT JOIN BEAS_FTPOS t2 ON t2.BELNR_ID = t1.BELNR_ID AND t2.BELPOS_ID = t1.BELPOS_ID 
        LEFT JOIN OITM t3 ON t3.ItemCode = (CASE WHEN t2.ItemCode LIKE '2101%' THEN '4301'+SUBSTRING(t2.ItemCode, 5,7) ELSE t2.ItemCode END)
        LEFT JOIN BEAS_FTHAUPT t4 ON t4.BELNR_ID = t1.BELNR_ID
        LEFT JOIN BEAS_APLATZ t5 ON t5.APLATZ_ID = t0.APLATZ_ID
        LEFT JOIN BEAS_STILLSTANDGRUND t6 ON t6.GRUNDID = t0.GRUNDID
        WHERE t10.DATUM_VON >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1) 
          AND t10.DATUM_VON < t10.DATUM_BIS
          AND t10.APLATZ_ID IN (SELECT APLATZ_ID FROM BEAS_APLATZ WHERE Active = 'J' AND GRUPPE IN ('Lathes', 'Milling') AND (APLATZ_ID NOT IN ('L02', 'L05', 'L08', 'L11', 'M04', 'M08', 'Mill', 'Turning')))
    ) t0
    WHERE t0.DATUM_VON < t0.End_Date
) i;
GO
```

### 1.3. Хранимые процедуры (Выгрузка и Запись)
```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_AddPlanSnapshot', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_AddPlanSnapshot;
IF OBJECT_ID('dbo.SP_GetProductionAnalytics', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_GetProductionAnalytics;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- 1. ПРОЦЕДУРА СОЗДАНИЯ ВЕРСИИ ПЛАНА
CREATE PROCEDURE [dbo].[SP_AddPlanSnapshot]
    @DaysAhead INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CurrentMonth DATE = DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0);
    DECLARE @NextVersion INT = ISNULL((SELECT MAX([Version_Num]) FROM [dbo].[GC_PLAN_SNAPSHOT] WHERE [Report_Month] = @CurrentMonth), 0) + 1;

    CREATE TABLE #TempPlan (
        [PRIOR_ID] NVARCHAR(50), [ItemCode] NVARCHAR(50), [ItemName] NVARCHAR(255),
        [BELNR_ID] INT, [BELPOS_ID] INT, [POS_ID] INT, [RESOURCE] NVARCHAR(50),
        [Описание станка] NVARCHAR(255), [Shift] NVARCHAR(100), [Setup_Done] NVARCHAR(100),
        [VERURSACHER_AGBEZ] NVARCHAR(255), [VON] DATETIME, [BIS] DATETIME,
        [Duration] FLOAT, [MENGE] FLOAT, [Plan_Qty_Details] FLOAT, [TEAPLATZ] FLOAT,
        [TRAPLATZ] FLOAT, [gc_intensity_fact] FLOAT, [TEAPLATZ_ALT] FLOAT,
        [Remainder_Order] FLOAT, [Price_for_1_min] FLOAT, [Narabotka_plan] FLOAT, [Date] DATE
    );

    INSERT INTO #TempPlan EXEC [dbo].[GetPlanReportForExell] @DaysAhead = @DaysAhead;

    INSERT INTO [dbo].[GC_PLAN_SNAPSHOT] (
        [Upload_Date], [Report_Month], [Version_Num], [PRIOR_ID], [ItemCode], [ItemName], 
        [BELNR_ID], [BELPOS_ID], [POS_ID], [RESOURCE], [Описание станка], [Shift], 
        [Setup_Done], [VERURSACHER_AGBEZ], [VON], [BIS], [Duration], [MENGE], 
        [Plan_Qty_Details], [TEAPLATZ], [TRAPLATZ], [gc_intensity_fact], [TEAPLATZ_ALT], 
        [Remainder_Order], [Price_for_1_min], [Narabotka_plan], [Date]
    )
    SELECT GETDATE(), @CurrentMonth, @NextVersion, * FROM #TempPlan;

    DROP TABLE #TempPlan;

    SELECT @NextVersion AS [NewVersion], @CurrentMonth AS [Month], N'Успешно создана Версия ' + CAST(@NextVersion AS NVARCHAR) AS [Message];
END
GO

-- 2. ПРОЦЕДУРА ВЫГРУЗКИ (API)
CREATE PROCEDURE [dbo].[SP_GetProductionAnalytics]
    @DateFrom DATE,
    @DateTo DATE,
    @PlanVersion INT = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    IF @PlanVersion IS NULL OR @PlanVersion = 0
    BEGIN
        DECLARE @Month DATE = DATEADD(month, DATEDIFF(month, 0, @DateFrom), 0);
        SET @PlanVersion = ISNULL((SELECT MAX([Version_Num]) FROM [dbo].[GC_PLAN_SNAPSHOT] WHERE [Report_Month] = @Month), 1);
    END

    SELECT 
        [Тип Данных], [Дата], [Смена], [Станок], [Заказ], [Позиция], [Операция], [Артикул], 
        [Версия_Плана], [План_Шт], [План_Время_Мин], [Факт_Шт], [Факт_Время_Мин], [Прерывания_Мин]
    FROM [dbo].[VW_PRODUCTION_ANALYTICS]
    WHERE [Дата] >= @DateFrom AND [Дата] <= @DateTo
      AND ([Версия_Плана] = @PlanVersion OR [Версия_Плана] = 0)
    ORDER BY [Дата], [Смена], [Станок];
END
GO

-- 1. ПРОЦЕДУРА ВЕРСИИ ЛОГОВ
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_GetPlanSnapshotLogs', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GetPlanSnapshotLogs;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetPlanSnapshotLogs]
AS
BEGIN
    SET NOCOUNT ON;

    -- Группируем данные, чтобы получить список уникальных версий
    SELECT 
        MAX(Upload_Date) AS [Дата_Создания], 
        Report_Month AS [Месяц], 
        Version_Num AS [Версия] 
    FROM [dbo].[GC_PLAN_SNAPSHOT] 
    GROUP BY Report_Month, Version_Num 
    ORDER BY Report_Month DESC, Version_Num DESC;
END
GO
```

---

## Часть 2. Google Apps Script (Фронтенд и Дашборды)

### 2.1. Файл `Code.gs`

Этот скрипт отвечает за меню, обращение к API базы данных и автоматическое построение двух сводных таблиц (включая гистограмму).

```javascript
var API_URL = "https://meridian-sap-api.shares.zrok.io/api/raw-query/exec";
var API_OPTIONS = {
  "method": "post",
  "contentType": "application/json",
  "muteHttpExceptions": true,
  "headers": { "skip_zrok_interstitial": "true" }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 Производство')
    .addItem('📥 1. Загрузить Аналитику (План/Факт)', 'showAnalyticsDialog')
    .addItem('📈 2. Детальный Дашборд (По дням)', 'buildDashboard')
    .addItem('📊 3. Общий Дашборд (Итоги + График)', 'buildAggregatedDashboard')
    .addSeparator()
    .addItem('📸 Создать новую версию плана (Snapshot)', 'createNewSnapshot')
    .addToUi();
}

function showAnalyticsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog')
      .setWidth(350).setHeight(400).setTitle('Загрузка Аналитики');
  SpreadsheetApp.getUi().showModalDialog(html, 'Параметры выгрузки');
}

function fetchAnalyticsData(params) {
  var query = "EXEC [dbo].[SP_GetProductionAnalytics] @DateFrom = '" + params.dateFrom + "', @DateTo = '" + params.dateTo + "', @PlanVersion = " + (params.version || "NULL");
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  var response = UrlFetchApp.fetch(API_URL, options);
  var json = JSON.parse(response.getContentText());
  
  if (!json.success || !json.data) {
    throw new Error("Ответ от SQL Server:\n" + (json.error || json.message || response.getContentText()));
  }
  
  var data = json.data;
  if(data.length === 0) return "Нет данных за этот период.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Аналитика_Данные");
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Аналитика_Данные");
  sheet.clear();

  var headers = ["Тип Данных", "Дата", "Смена", "Станок", "Заказ", "Позиция", "Операция", "Артикул", "Версия Плана", "План Шт", "План Мин", "Факт Шт", "Факт Мин", "Прерывания Мин"];
  var rows = [headers];
  
  for (var i = 0; i < data.length; i++) {
    rows.push([
      data[i]["Тип Данных"], formatSqlDateRegex(data[i]["Дата"]), data[i]["Смена"], data[i]["Станок"],
      data[i]["Заказ"] || "", data[i]["Позиция"] || "", data[i]["Операция"] || "", data[i]["Артикул"] || "",
      data[i]["Версия_Плана"],
      parseNumber(data[i]["План_Шт"]), parseNumber(data[i]["План_Время_Мин"]),
      parseNumber(data[i]["Факт_Шт"]), parseNumber(data[i]["Факт_Время_Мин"]),
      parseNumber(data[i]["Прерывания_Мин"])
    ]);
  }

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:N1").setFontWeight("bold").setBackground("#d9ead3");
  sheet.getRange(2, 2, rows.length-1, 1).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(2, 10, rows.length-1, 5).setNumberFormat("0.00");

  return "Успешно загружено строк: " + (rows.length - 1);
}

function createNewSnapshot() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Снимок Плана", "На сколько дней вперед сохранить план? (по умолчанию 30):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var days = parseInt(response.getResponseText().trim()) || 30;

  var query = "EXEC [dbo].[SP_AddPlanSnapshot] @DaysAhead = " + days;
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    if (json.success && json.data && json.data.length > 0) {
      ui.alert("Успех!", json.data[0].Message + "\nМесяц: " + formatSqlDateRegex(json.data[0].Month), ui.ButtonSet.OK);
    }
  } catch (e) { ui.alert("Критическая ошибка: " + e.toString()); }
}

// ---------------------------------------------------------
// ДАШБОРД 1: ДЕТАЛЬНЫЙ (Разбор смен и станков)
// ---------------------------------------------------------
function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📈 Детальный Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(2).showTotals(true);  // Дата
  pivotTable.addRowGroup(3).showTotals(true);  // Смена
  pivotTable.addRowGroup(4).showTotals(true);  // Станок
  pivotTable.addRowGroup(8).showTotals(false); // Деталь

  pivotTable.addPivotValue(10, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)');
  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)');
  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)');

  dashSheet.getRange("A1").setValue("Производственный Дашборд: Детальный (План / Факт / Простой)")
           .setFontSize(14).setFontWeight("bold").setFontColor("#1a73e8");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте станок (+), чтобы увидеть детализацию по артикулам")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 100); dashSheet.setColumnWidth(2, 70);
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 150);
  dashSheet.getRange("E:J").setNumberFormat('[=0]"";#,##0.##'); 
  dashSheet.getRange("G:G").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);
}

// ---------------------------------------------------------
// ДАШБОРД 2: ОБЩИЙ АГРЕГИРОВАННЫЙ (Итоги + График)
// ---------------------------------------------------------
function buildAggregatedDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📊 Общий Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(2); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  // Иерархия: Деталь -> Заказ
  pivotTable.addRowGroup(8).showTotals(true);  
  pivotTable.addRowGroup(5).showTotals(false); 

  pivotTable.addPivotValue(10, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (шт)');
  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (мин)');
  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (мин)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Простой (мин)');

  dashSheet.getRange("A1").setValue("Агрегированный Дашборд: Итоги за выбранный период")
           .setFontSize(14).setFontWeight("bold").setFontColor("#b31412");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте Деталь (+), чтобы увидеть номера Заказов")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 200); dashSheet.setColumnWidth(2, 90);  
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 110); 
  dashSheet.setColumnWidth(5, 100); dashSheet.setColumnWidth(6, 110); 
  dashSheet.setColumnWidth(7, 110); dashSheet.setColumnWidth(8, 130); 

  dashSheet.getRange("C:H").setNumberFormat('[=0]"";#,##0.##'); 
  dashSheet.getRange("E:E").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);

  // ==========================================
  // ГЕНЕРАЦИЯ ДИАГРАММЫ (План vs Факт)
  // ==========================================
  SpreadsheetApp.flush(); // Применяем сводную таблицу к листу, чтобы получить высоту
  var lastRow = dashSheet.getLastRow();
  
  if (lastRow > 4) { // Если есть данные, кроме заголовка
    var chart = dashSheet.newChart()
      .asColumnChart()
      .addRange(dashSheet.getRange(3, 1, lastRow - 3, 1)) // Ось X: Артикулы (Колонка A)
      .addRange(dashSheet.getRange(3, 3, lastRow - 3, 2)) // Серии: План Шт (C) и Факт Шт (D)
      .setNumHeaders(1)
      .setOption('title', 'Сравнение: План vs Факт по деталям')
      .setOption('hAxis.title', 'Артикул')
      .setOption('vAxis.title', 'Кол-во (шт)')
      .setOption('legend', {position: 'top'})
      .setOption('colors', ['#4285F4', '#34A853']) // Цвета: синий для плана, зеленый для факта
      .setPosition(3, 10, 0, 0) // Размещаем справа от таблицы (в районе колонки J)
      .setOption('width', 800)
      .setOption('height', 450)
      .build();
      
    dashSheet.insertChart(chart);
  }
}

// Утилиты
function formatSqlDateRegex(sqlDateStr) {
  if (!sqlDateStr) return '';
  var match = sqlDateStr.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + "." + match[2] + "." + match[1] : sqlDateStr;
}

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}
```

### 2.2. Файл `Dialog.html` (UI окно)
(Код окна для выбора дат и ввода версии плана. Файл создается через Плюс (+) -> HTML).

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 20px; background-color: #f8f9fa; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; color: #333; font-size: 14px; }
      input[type="date"], input[type="number"] { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
      .btn { background-color: #1a73e8; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; font-size: 14px; }
      .btn:hover { background-color: #1557b0; }
      #status { margin-top: 15px; font-size: 13px; color: #d93025; text-align: center; }
      .spinner { display: none; margin: 0 auto; border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="form-group">
      <label>Дата С (От):</label>
      <input type="date" id="dateFrom" required>
    </div>
    <div class="form-group">
      <label>Дата По (До):</label>
      <input type="date" id="dateTo" required>
    </div>
    <div class="form-group">
      <label>Версия Плана (0 = Последняя):</label>
      <input type="number" id="version" value="0" min="0">
    </div>
    
    <button class="btn" onclick="submitForm()">Загрузить Аналитику</button>
    
    <div style="margin-top: 15px; text-align: center;">
      <div class="spinner" id="spinner"></div>
      <div id="status"></div>
    </div>

    <script>
      var d = new Date();
      document.getElementById('dateFrom').value = new Date(d.getFullYear(), d.0, 2).toISOString().split('T')[0];
      document.getElementById('dateTo').value = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0];

      function submitForm() {
        document.getElementById('spinner').style.display = 'block';
        document.getElementById('status').innerText = 'Загрузка с сервера...';
        var params = {
          dateFrom: document.getElementById('dateFrom').value,
          dateTo: document.getElementById('dateTo').value,
          version: document.getElementById('version').value
        };
        google.script.run
          .withSuccessHandler(function(res) {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('status').style.color = '#188038';
            document.getElementById('status').innerText = res;
            setTimeout(function() { google.script.host.close(); }, 1500);
          })
          .withFailureHandler(function(err) {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('status').style.color = '#d93025';
            document.getElementById('status').innerText = err.message;
          })
          .fetchAnalyticsData(params);
      }
    </script>
  </body>
</html>
```

### Реализация логов

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_GetPlanSnapshotLogs', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GetPlanSnapshotLogs;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetPlanSnapshotLogs]
AS
BEGIN
    SET NOCOUNT ON;

    -- Группируем данные, чтобы получить список уникальных версий
    SELECT 
        MAX(Upload_Date) AS [Дата_Создания], 
        Report_Month AS [Месяц], 
        Version_Num AS [Версия] 
    FROM [dbo].[GC_PLAN_SNAPSHOT] 
    GROUP BY Report_Month, Version_Num 
    ORDER BY Report_Month DESC, Version_Num DESC;
END
GO
```

Обновленный код

```js
var API_URL = "https://meridian-sap-api.shares.zrok.io/api/raw-query/exec";
var API_OPTIONS = {
  "method": "post",
  "contentType": "application/json",
  "muteHttpExceptions": true,
  "headers": { "skip_zrok_interstitial": "true" }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 Производство')
    .addItem('📥 1. Загрузить Аналитику (План/Факт)', 'showAnalyticsDialog')
    .addItem('📈 2. Детальный Дашборд (По дням)', 'buildDashboard')
    .addItem('📊 3. Общий Дашборд (Итоги + График)', 'buildAggregatedDashboard')
    .addSeparator()
    .addItem('📸 Создать новую версию плана (Snapshot)', 'createNewSnapshot')
    .addItem('📖 Загрузить историю версий (Логи из БД)', 'fetchVersionLogs') // НОВАЯ КНОПКА
    .addToUi();
}

function showAnalyticsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog')
      .setWidth(350).setHeight(400).setTitle('Загрузка Аналитики');
  SpreadsheetApp.getUi().showModalDialog(html, 'Параметры выгрузки');
}

function fetchAnalyticsData(params) {
  var query = "EXEC [dbo].[SP_GetProductionAnalytics] @DateFrom = '" + params.dateFrom + "', @DateTo = '" + params.dateTo + "', @PlanVersion = " + (params.version || "NULL");
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  var response = UrlFetchApp.fetch(API_URL, options);
  var json = JSON.parse(response.getContentText());
  
  if (!json.success || !json.data) {
    throw new Error("Ответ от SQL Server:\n" + (json.error || json.message || response.getContentText()));
  }
  
  var data = json.data;
  if(data.length === 0) return "Нет данных за этот период.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Аналитика_Данные");
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Аналитика_Данные");
  sheet.clear();

  var headers = ["Тип Данных", "Дата", "Смена", "Станок", "Заказ", "Позиция", "Операция", "Артикул", "Версия Плана", "План Шт", "План Мин", "Факт Шт", "Факт Мин", "Прерывания Мин"];
  var rows = [headers];
  
  for (var i = 0; i < data.length; i++) {
    rows.push([
      data[i]["Тип Данных"], formatSqlDateRegex(data[i]["Дата"]), data[i]["Смена"], data[i]["Станок"],
      data[i]["Заказ"] || "", data[i]["Позиция"] || "", data[i]["Операция"] || "", data[i]["Артикул"] || "",
      data[i]["Версия_Плана"],
      parseNumber(data[i]["План_Шт"]), parseNumber(data[i]["План_Время_Мин"]),
      parseNumber(data[i]["Факт_Шт"]), parseNumber(data[i]["Факт_Время_Мин"]),
      parseNumber(data[i]["Прерывания_Мин"])
    ]);
  }

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:N1").setFontWeight("bold").setBackground("#d9ead3");
  sheet.getRange(2, 2, rows.length-1, 1).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(2, 10, rows.length-1, 5).setNumberFormat("0.00");

  return "Успешно загружено строк: " + (rows.length - 1);
}

function createNewSnapshot() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Снимок Плана", "На сколько дней вперед сохранить план? (по умолчанию 30):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var days = parseInt(response.getResponseText().trim()) || 30;

  var query = "EXEC [dbo].[SP_AddPlanSnapshot] @DaysAhead = " + days;
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    if (json.success && json.data && json.data.length > 0) {
      
      var newVersion = json.data[0].NewVersion;
      var month = formatSqlDateRegex(json.data[0].Month);
      var message = json.data[0].Message;
      
      // =====================================
      // ПИШЕМ ЛОГ В ТАБЛИЦУ
      // =====================================
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("📖 Логи Версий");
      if (!logSheet) {
        logSheet = ss.insertSheet("📖 Логи Версий");
        logSheet.appendRow(["Дата и время выгрузки", "Отчетный Месяц", "Доступная Версия (План)", "Горизонт"]);
        logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
        logSheet.setFrozenRows(1);
      }
      
      // Получаем текущее время
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm:ss");
      logSheet.appendRow([timestamp, month, newVersion, days + " дней"]);
      logSheet.autoResizeColumns(1, 4);
      // =====================================

      ui.alert("Успех!", message + "\nМесяц: " + month + "\nЗапись добавлена в логи.", ui.ButtonSet.OK);
    }
  } catch (e) { ui.alert("Критическая ошибка: " + e.toString()); }
}

// ---------------------------------------------------------
// ДАШБОРД 1: ДЕТАЛЬНЫЙ (Разбор смен и станков)
// ---------------------------------------------------------
function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📈 Детальный Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(2).showTotals(true);  // Дата
  pivotTable.addRowGroup(3).showTotals(true);  // Смена
  pivotTable.addRowGroup(4).showTotals(true);  // Станок
  pivotTable.addRowGroup(8).showTotals(false); // Деталь

  pivotTable.addPivotValue(10, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)');
  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)');
  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)');

  dashSheet.getRange("A1").setValue("Производственный Дашборд: Детальный (План / Факт / Простой)")
           .setFontSize(14).setFontWeight("bold").setFontColor("#1a73e8");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте станок (+), чтобы увидеть детализацию по артикулам")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 100); dashSheet.setColumnWidth(2, 70);
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 150);
  dashSheet.getRange("E:J").setNumberFormat('[=0]"";#,##0.##'); 
  dashSheet.getRange("G:G").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);
}

// ---------------------------------------------------------
// ДАШБОРД 2: ОБЩИЙ АГРЕГИРОВАННЫЙ (Итоги + График)
// ---------------------------------------------------------
function buildAggregatedDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📊 Общий Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(2); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  // Иерархия: Деталь -> Заказ
  pivotTable.addRowGroup(8).showTotals(true);  
  pivotTable.addRowGroup(5).showTotals(false); 

  pivotTable.addPivotValue(10, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (шт)');
  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (мин)');
  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (мин)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Простой (мин)');

  dashSheet.getRange("A1").setValue("Агрегированный Дашборд: Итоги за выбранный период")
           .setFontSize(14).setFontWeight("bold").setFontColor("#b31412");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте Деталь (+), чтобы увидеть номера Заказов")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 200); dashSheet.setColumnWidth(2, 90);  
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 110); 
  dashSheet.setColumnWidth(5, 100); dashSheet.setColumnWidth(6, 110); 
  dashSheet.setColumnWidth(7, 110); dashSheet.setColumnWidth(8, 130); 

  dashSheet.getRange("C:H").setNumberFormat('[=0]"";#,##0.##'); 
  dashSheet.getRange("E:E").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);

  // ==========================================
  // ГЕНЕРАЦИЯ ДИАГРАММЫ (План vs Факт)
  // ==========================================
  SpreadsheetApp.flush(); // Применяем сводную таблицу к листу, чтобы получить высоту
  var lastRow = dashSheet.getLastRow();
  
  if (lastRow > 4) { // Если есть данные, кроме заголовка
    var chart = dashSheet.newChart()
      .asColumnChart()
      .addRange(dashSheet.getRange(3, 1, lastRow - 3, 1)) // Ось X: Артикулы (Колонка A)
      .addRange(dashSheet.getRange(3, 3, lastRow - 3, 2)) // Серии: План Шт (C) и Факт Шт (D)
      .setNumHeaders(1)
      .setOption('title', 'Сравнение: План vs Факт по деталям')
      .setOption('hAxis.title', 'Артикул')
      .setOption('vAxis.title', 'Кол-во (шт)')
      .setOption('legend', {position: 'top'})
      .setOption('colors', ['#4285F4', '#34A853']) // Цвета: синий для плана, зеленый для факта
      .setPosition(3, 10, 0, 0) // Размещаем справа от таблицы (в районе колонки J)
      .setOption('width', 800)
      .setOption('height', 450)
      .build();
      
    dashSheet.insertChart(chart);
  }
}

// Утилиты
function formatSqlDateRegex(sqlDateStr) {
  if (!sqlDateStr) return '';
  var match = sqlDateStr.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + "." + match[2] + "." + match[1] : sqlDateStr;
}

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}

// Функция выгрузки логов напрямую из SQL Server
// Функция выгрузки логов напрямую из SQL Server
function fetchVersionLogs() {
  var ui = SpreadsheetApp.getUi();
  
  // ИСПОЛЬЗУЕМ EXEC ДЛЯ ВЫЗОВА ПРОЦЕДУРЫ!
  var query = "EXEC [dbo].[SP_GetPlanSnapshotLogs]";
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    
    if (!json.success || !json.data) {
      throw new Error(json.error || json.message || res.getContentText());
    }
    
    var data = json.data;
    if (data.length === 0) {
      ui.alert("В базе данных пока нет ни одной сохраненной версии плана.");
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("📖 Логи Версий");
    if (!logSheet) logSheet = ss.insertSheet("📖 Логи Версий");
    
    logSheet.clear(); // Очищаем старое
    
    var rows = [["Дата и время выгрузки (в базе)", "Отчетный Месяц", "Доступная Версия (План)"]];
    for (var i = 0; i < data.length; i++) {
      var uploadDate = data[i]["Дата_Создания"] ? data[i]["Дата_Создания"].toString().replace('T', ' ').substring(0, 19) : "";
      var reportMonth = formatSqlDateRegex(data[i]["Месяц"]);
      
      rows.push([uploadDate, reportMonth, data[i]["Версия"]]);
    }
    
    logSheet.getRange(1, 1, rows.length, 3).setValues(rows);
    logSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#fff2cc");
    logSheet.autoResizeColumns(1, 3);
    
    ui.alert("Логи успешно восстановлены из Базы Данных!");
    
  } catch (e) {
    ui.alert("Ошибка загрузки логов: " + e.toString());
  }
}
```

# Получать коментарии наладчиков и операторов с телеграмм бота

Есть бот который хранит коментарии наладчиков и ореператор в течении смены (неисправности, другие нюансы работы)

Необходимо получать эти коментарии по данной детали, номеру документа, позиции и операции, имя оператора. Если они соподают то берем и выгружаем их в нужную ячейку в наш общий анализ. Думаю получать все отдельно а потом уже агрегировать в нашей таблице. Создать получить коментарии он их выгружает в отдельную колонку, но по тем деталям что уже есть в аналитике данных. Далее нажимаем кнопку сформировать коментарии и он добовляет к текущим дащборду последней строчкой комментарии. Как и в детальном дашборде так и а общем.

Как выглядит инфа в БД.

**Сам отчет**

У нас чек лист состоит их отчета и сброрке и также отдельно коменты. При выгрузке мы должны всю инфу объединить. Типо сначало нас отчет по подготовке со всеми ответами на вопросы и коментариями и дальше уже идут коменты от наладчиков все по данному совпадению.

SELECT TOP (1000) [Id]
      ,[Text]
      ,[SortOrder]
      ,[IsActive]
  FROM [ChecklistBot].[dbo].[ToolQuestions]

Id	Text	SortOrder	IsActive
1	Инструмент собран согласно карте наладки	1	1
2	Отсутствует износ и видимые повреждения	2	1
3	Диаметры и длина режущей части соответствует карте наладки	3	1
4	Занижение соответствует карте наладки	4	1
5	Биение инструмента в оправке отсутствует	5	1
6	Вылеты инструмента соответствуют карте наладки	6	1
7	Инструмент надежно зафиксирован	7	1
8	Инструмент верно прорисован в проекте	8	1

SELECT TOP (1000) [Id]
      ,[MachineCode]
      ,[OperationType]
      ,[DocNumber]
      ,[DocPosition]
      ,[PartNumber]
      ,[OperationNumber]
      ,[AuthorTelegramId]
      ,[AuthorFullName]
      ,[CreatedAt]
  FROM [ChecklistBot].[dbo].[ToolReports]

Id	MachineCode	OperationType	DocNumber	DocPosition	PartNumber	OperationNumber	AuthorTelegramId	AuthorFullName	CreatedAt
1	M12	Обработка	5104	60	21010008317	60	671190103	Влад	2026-08-17 10:39:53.3300000

SELECT TOP (1000) [Id]
      ,[ReportId]
      ,[QuestionId]
      ,[IsOk]
      ,[Note]
  FROM [ChecklistBot].[dbo].[ToolReportAnswers]

Id	ReportId	QuestionId	IsOk	Note
1	1	1	1	NULL
2	1	2	0	Тест
3	1	3	1	NULL
4	1	4	0	Тест
5	1	5	1	NULL

**Сами комменты**

SELECT TOP (1000) [Id]
      ,[MachineCode]
      ,[PartNumber]
      ,[OperationNumber]
      ,[Message]
      ,[AuthorTelegramId]
      ,[AuthorFullName]
      ,[CreatedAt]
      ,[OperationType]
      ,[DocNumber]
      ,[DocPosition]
  FROM [ChecklistBot].[dbo].[Checklists]

Id	MachineCode	PartNumber	OperationNumber	Message	AuthorTelegramId	AuthorFullName	CreatedAt	OperationType	DocNumber	DocPosition
1	M12	21010008317	60	Смещена сетка отверстий и торцевые грани в модели NX для получения соосности и симметричности. Размер после расточки 12.94 мм. Имеется бочкообразность размера 12.96, H8 около 0.01 мм. Нет резьбофрез по стали. Обработка с испорченными резьбофрезами. Фреза чистовая F8 был изменен в вылет. У метчика M8 на 0,75 выкрашена режущая кромка. Резьба фреза M2, не нарезана резьба вследствие поломки резьбы фрезы. Фрезерование с дна отверстия. Изменено направление от поверхности к дну отверстия. Уменьшена скорость резания и подача. обработка остановлена, изменена программа ЧПУ.	671190103	Влад	2026-08-17 10:40:14.9929816	Обработка	5104	60

## Сформировали процедуру

```sql
USE [ChecklistBot]
GO

/****** Объект:  StoredProcedure [dbo].[SP_GetBotComments]    Дата создания скрипта: 18.08.2026 8:47:15 ******/ 
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_GetBotComments] AS
BEGIN
    SET NOCOUNT ON;
    WITH AllLogs AS (
        SELECT r.MachineCode, CAST(r.DocNumber AS NVARCHAR(50)) AS DocNumber, CAST(r.DocPosition AS NVARCHAR(50)) AS DocPosition, CAST(r.OperationNumber AS NVARCHAR(50)) AS OperationNumber,
        CONCAT(N'🛠 [', FORMAT(r.CreatedAt, 'dd.MM HH:mm'), N' ', r.AuthorFullName, N'] Чек-лист: ', q.Text, N' - ', CASE WHEN a.IsOk = 1 THEN N'ОК' ELSE N'НЕ ОК' END, ISNULL(N' (' + a.Note + N')', N'')) AS LogText, r.CreatedAt
        FROM [dbo].[ToolReports] r JOIN [dbo].[ToolReportAnswers] a ON r.Id = a.ReportId JOIN [dbo].[ToolQuestions] q ON a.QuestionId = q.Id
        UNION ALL
        SELECT c.MachineCode, CAST(c.DocNumber AS NVARCHAR(50)), CAST(c.DocPosition AS NVARCHAR(50)), CAST(c.OperationNumber AS NVARCHAR(50)),
        CONCAT(N'💬 [', FORMAT(c.CreatedAt, 'dd.MM HH:mm'), N' ', c.AuthorFullName, N'] Коммент: ', c.Message), c.CreatedAt
        FROM [dbo].[Checklists] c
    )
    SELECT RTRIM(LTRIM(MachineCode)) AS MachineCode, RTRIM(LTRIM(DocNumber)) AS DocNumber, RTRIM(LTRIM(DocPosition)) AS DocPosition, RTRIM(LTRIM(OperationNumber)) AS OperationNumber,
    STRING_AGG(LogText, CHAR(10)) WITHIN GROUP (ORDER BY CreatedAt) AS FullComment
    FROM AllLogs GROUP BY MachineCode, DocNumber, DocPosition, OperationNumber;
END
GO
```

## Создали новый роут на сервере

```js
//bot-query.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BotQueryService } from './bot-query.service';

@Controller('api/bot-query')
export class BotQueryController {
  constructor(private readonly botQueryService: BotQueryService) {}

  @Post('exec')
  async executeExec(@Body() body: { query: string }) {
    if (!body.query) throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
    return this.botQueryService.executeExecString(body.query);
  }
}

//bot-query.module.ts
import { Module } from '@nestjs/common';
import { BotQueryController } from './bot-query.controller';  
import { BotQueryService } from './bot-query.service';         

@Module({
  controllers: [BotQueryController],
  providers: [BotQueryService],
  exports: [BotQueryService],
})
export class BotQueryModule {}

//bot-query.service.ts
import { Injectable, HttpException, HttpStatus, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as sql from 'mssql';

@Injectable()
export class BotQueryService implements OnModuleInit, OnModuleDestroy {
  private pool: sql.ConnectionPool | null = null;
  private isInitializing = false;
  private initPromise: Promise<sql.ConnectionPool> | null = null;

  private readonly allowedPattern = /^\s*(EXEC|EXECUTE)\s+/i;
  
  // Список запрещенных слов 
  private readonly forbiddenKeywords = [
    'DROP', 'ALTER', 'CREATE', 'INSERT', 'UPDATE', 'DELETE',
    'TRUNCATE', 'MERGE', 'GRANT', 'REVOKE',
    'BACKUP', 'RESTORE', 'DBCC',
  ];

  async onModuleInit() {
    await this.initializePool();
  }

  async onModuleDestroy() {
    await this.closePool();
  }

  private async initializePool(): Promise<sql.ConnectionPool> {
    if (this.pool && this.pool.connected) {
      return this.pool;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    
    this.initPromise = (async () => {
      const config: sql.config = {
        server: process.env.BOT_DB_SERVER || process.env.DB_SERVER,
        database: process.env.BOT_DB_DATABASE || 'ChecklistBot',
        user: process.env.BOT_DB_USER || process.env.DB_USER,
        password: process.env.BOT_DB_PASSWORD || process.env.DB_PASSWORD,
        port: parseInt(process.env.BOT_DB_PORT || '1433', 10),
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true
        },
        pool: {
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 10000,
        }
      };

      // ИСПРАВЛЕНИЕ: Создаем полностью изолированный пул соединений
      const localPool = new sql.ConnectionPool(config);
      this.pool = await localPool.connect();
      
      console.log('✅ Bot Database pool connected (ISOLATED)');
      return this.pool;
    })();

    try {
      const pool = await this.initPromise;
      return pool;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.log('🔴 Bot Database pool closed');
    }
  }

  async executeExecString(execString: string): Promise<any> {
    if (!execString || typeof execString !== 'string') {
      throw new HttpException('EXEC string is required', HttpStatus.BAD_REQUEST);
    }

    if (!this.allowedPattern.test(execString)) {
      throw new HttpException(
        'String must start with EXEC or EXECUTE',
        HttpStatus.BAD_REQUEST,
      );
    }

    const upperString = execString.toUpperCase();
    for (const keyword of this.forbiddenKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(upperString)) {
        throw new HttpException(
          `Keyword '${keyword}' is not allowed`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    try {
      const pool = await this.initializePool();
      const result = await pool.request().query(execString);

      return {
        success: true,
        data: result.recordset,
        rowsAffected: result.rowsAffected?.[0] ?? 0,
      };
    } catch (error) {
      throw new HttpException(
        `EXEC execution failed: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
```

## Реализация версия 1

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.VW_PRODUCTION_ANALYTICS', 'V') IS NOT NULL
    DROP VIEW dbo.VW_PRODUCTION_ANALYTICS;
GO

CREATE VIEW [dbo].[VW_PRODUCTION_ANALYTICS] AS

-- ===================================
-- 1. СРЕЗ: ПЛАН (Оператор NULL)
-- ===================================
SELECT 
    N'План' AS [Тип Данных],
    CONVERT(DATE, RIGHT(RTRIM(p.[Shift]), 10), 104) AS [Дата],
    CAST(LEFT(RTRIM(p.[Shift]), 1) AS INT) AS [Смена],
    RTRIM(LTRIM(p.RESOURCE)) AS [Станок],
    RTRIM(LTRIM(CAST(p.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа], -- Переименовано
    RTRIM(LTRIM(CAST(p.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(p.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(p.ItemCode)) AS [Артикул],
    NULL AS [Оператор], -- В плане нет фактического оператора
    p.[Version_Num] AS [Версия_Плана],
    p.Plan_Qty_Details AS [План_Шт],
    p.Duration AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_PLAN_SNAPSHOT] p

UNION ALL

-- ===================================
-- 2. СРЕЗ: ФАКТ (ФИО из DisplayName)
-- ===================================
SELECT 
    CASE WHEN f.Kol_detalej < 0 THEN N'Факт (Брак/Сторно)' ELSE N'Факт' END AS [Тип Данных],
    f.Date AS [Дата],
    CAST(f.[Shift] AS INT) AS [Смена],
    RTRIM(LTRIM(f.APLATZ_ID)) AS [Станок],
    RTRIM(LTRIM(CAST(f.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа], -- Переименовано
    RTRIM(LTRIM(CAST(f.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(f.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(f.ItemCode)) AS [Артикул],
    RTRIM(LTRIM(f.DisplayName)) AS [Оператор], -- ФИО оператора из ФАКТА
    0 AS [Версия_Плана],
    0, 0,
    CASE WHEN f.Kol_detalej > 0 THEN f.Kol_detalej ELSE 0 END AS [Факт_Шт],
    CASE WHEN f.[End Time] >= f.[Start Time] THEN DATEDIFF(MINUTE, f.[Start Time], f.[End Time]) ELSE 0 END AS [Fact_Min],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_FACT_FINANCIAL_REPORT] f
WHERE f.[Start Time] IS NOT NULL AND f.[End Time] IS NOT NULL

UNION ALL

-- ===================================
-- 3. СРЕЗ: ПРЕРЫВАНИЯ (ФИО из PERS_ID_Name)
-- ===================================
SELECT 
    N'Прерывание' AS [Тип Данных],
    i.Дата AS [Дата],
    CAST(i.Смена AS INT) AS [Смена],
    RTRIM(LTRIM(i.APLATZ_ID)) AS [Станок],
    ISNULL(RTRIM(LTRIM(CAST(i.BELNR_ID AS NVARCHAR(50)))), N'Вне документа') AS [Номер документа], -- Переименовано
    ISNULL(RTRIM(LTRIM(CAST(i.BELPOS_ID AS NVARCHAR(50)))), N'-') AS [Позиция],
    ISNULL(RTRIM(LTRIM(CAST(i.POS_ID AS NVARCHAR(50)))), N'-') AS [Операция],
    ISNULL(RTRIM(LTRIM(i.ItemCode)), N'Общий простой станка') AS [Артикул],
    RTRIM(LTRIM(i.PERS_ID_Name)) AS [Оператор], -- ФИО из прерываний
    0 AS [Версия_Плана],
    0, 0, 0, 0,
    i.[Продолжительность, мин] AS [Прерывания_Мин]
FROM (
    SELECT t0.*
    FROM (
        SELECT 
            t0.APLATZ_ID, t10.DATUM_VON, 
            CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END AS End_Date,
            t10.DATUM_BIS, t0.INTNR, t0.GRUNDID, t6.GRUNDINFO AS Стандарт_наименование_прерывания, 
            t0.GRUNDINFO, t0.PERS_ID_Name, t0.PERS_ID_END_Name, t0.UDF1, t0.UDF2,
            DATEDIFF(mi, t10.DATUM_VON, (CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END)) AS [Продолжительность, мин],
            t2.ItemCode, 
            t3.U_RESP_USER, t4.KND_ID, t4.KNDNAME, t5.bez,
            CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END AS Смена,
            CASE 
                WHEN (CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END) = 1 THEN CAST(t10.DATUM_VON AS DATE)
                WHEN CAST(t10.DATUM_VON AS TIME) BETWEEN '19:00:00.0000000' AND '23:59:59.0000000' THEN CAST(t10.DATUM_VON AS DATE)
                ELSE CAST(DATEADD(day, -1, t10.DATUM_VON) AS DATE)
            END AS Дата,
            t1.BUCHNR_ID, t1.ANFZEIT, t1.ENDZEIT, t1.ZEIT, t1.BELNR_ID, t1.BELPOS_ID, t1.POS_ID
        FROM GC_APLATZ_STILLSTAND_BY_SHIFT t10
        LEFT JOIN BEAS_APLATZ_STILLSTAND t0 ON t10.INTNR = t0.INTNR AND t10.APLATZ_ID = t0.APLATZ_ID
        LEFT JOIN beas_arbzeit t1 ON t1.APLATZ_ID = t0.APLATZ_ID AND t0.DATUM_VON >= t1.ANFZEIT AND t0.DATUM_VON < t1.ENDZEIT 
        LEFT JOIN BEAS_FTPOS t2 ON t2.BELNR_ID = t1.BELNR_ID AND t2.BELPOS_ID = t1.BELPOS_ID 
        LEFT JOIN OITM t3 ON t3.ItemCode = (CASE WHEN t2.ItemCode LIKE '2101%' THEN '4301'+SUBSTRING(t2.ItemCode, 5,7) ELSE t2.ItemCode END)
        LEFT JOIN BEAS_FTHAUPT t4 ON t4.BELNR_ID = t1.BELNR_ID
        LEFT JOIN BEAS_APLATZ t5 ON t5.APLATZ_ID = t0.APLATZ_ID
        LEFT JOIN BEAS_STILLSTANDGRUND t6 ON t6.GRUNDID = t0.GRUNDID
        WHERE t10.DATUM_VON >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1) 
          AND t10.DATUM_VON < t10.DATUM_BIS
          AND t10.APLATZ_ID IN (SELECT APLATZ_ID FROM BEAS_APLATZ WHERE Active = 'J' AND GRUPPE IN ('Lathes', 'Milling') AND (APLATZ_ID NOT IN ('L02', 'L05', 'L08', 'L11', 'M04', 'M08', 'Mill', 'Turning')))
    ) t0
    WHERE t0.DATUM_VON < t0.End_Date
) i;
GO

USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_GetProductionAnalytics', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_GetProductionAnalytics;
GO

CREATE PROCEDURE [dbo].[SP_GetProductionAnalytics]
    @DateFrom DATE,
    @DateTo DATE,
    @PlanVersion INT = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    IF @PlanVersion IS NULL OR @PlanVersion = 0
    BEGIN
        DECLARE @Month DATE = DATEADD(month, DATEDIFF(month, 0, @DateFrom), 0);
        SET @PlanVersion = ISNULL((SELECT MAX([Version_Num]) FROM [dbo].[GC_PLAN_SNAPSHOT] WHERE [Report_Month] = @Month), 1);
    END

    SELECT 
        [Тип Данных], [Дата], [Смена], [Станок], [Номер документа], [Позиция], [Операция], [Артикул], [Оператор],
        [Версия_Плана], [План_Шт], [План_Время_Мин], [Факт_Шт], [Факт_Время_Мин], [Прерывания_Мин]
    FROM [dbo].[VW_PRODUCTION_ANALYTICS]
    WHERE [Дата] >= @DateFrom AND [Дата] <= @DateTo
      AND ([Версия_Плана] = @PlanVersion OR [Версия_Плана] = 0)
    ORDER BY [Дата], [Смена], [Станок];
END
GO

USE [ChecklistBot]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_GetBotComments] AS
BEGIN
    SET NOCOUNT ON;
    
    WITH AllLogs AS (
        SELECT 
            r.MachineCode, 
            CAST(r.PartNumber AS NVARCHAR(50)) AS PartNumber,
            CAST(r.DocNumber AS NVARCHAR(50)) AS DocNumber, 
            CAST(r.DocPosition AS NVARCHAR(50)) AS DocPosition, 
            CAST(r.OperationNumber AS NVARCHAR(50)) AS OperationNumber,
            RTRIM(LTRIM(r.AuthorFullName)) AS AuthorFullName, -- ФИО автора
            CONCAT(N'🛠 [', FORMAT(r.CreatedAt, 'dd.MM HH:mm'), N'] Чек-лист: ', q.Text, N' - ', CASE WHEN a.IsOk = 1 THEN N'ОК' ELSE N'НЕ ОК' END, ISNULL(N' (' + a.Note + N')', N'')) AS LogText, 
            r.CreatedAt
        FROM [dbo].[ToolReports] r 
        JOIN [dbo].[ToolReportAnswers] a ON r.Id = a.ReportId 
        JOIN [dbo].[ToolQuestions] q ON a.QuestionId = q.Id
        
        UNION ALL
        
        SELECT 
            c.MachineCode, 
            CAST(c.PartNumber AS NVARCHAR(50)) AS PartNumber,
            CAST(c.DocNumber AS NVARCHAR(50)), 
            CAST(c.DocPosition AS NVARCHAR(50)), 
            CAST(c.OperationNumber AS NVARCHAR(50)),
            RTRIM(LTRIM(c.AuthorFullName)) AS AuthorFullName, -- ФИО автора
            CONCAT(N'💬 [', FORMAT(c.CreatedAt, 'dd.MM HH:mm'), N'] Коммент: ', c.Message), 
            c.CreatedAt
        FROM [dbo].[Checklists] c
    )
    SELECT 
        RTRIM(LTRIM(MachineCode)) AS MachineCode, 
        RTRIM(LTRIM(PartNumber)) AS PartNumber,
        RTRIM(LTRIM(DocNumber)) AS DocNumber, 
        RTRIM(LTRIM(DocPosition)) AS DocPosition, 
        RTRIM(LTRIM(OperationNumber)) AS OperationNumber,
        RTRIM(LTRIM(AuthorFullName)) AS AuthorFullName, -- Возвращаем в результирующий набор
        STRING_AGG(LogText, CHAR(10)) WITHIN GROUP (ORDER BY CreatedAt) AS FullComment
    FROM AllLogs 
    GROUP BY MachineCode, PartNumber, DocNumber, DocPosition, OperationNumber, AuthorFullName;
END
GO
```


```js
var API_URL = "https://meridian-sap-api.shares.zrok.io/api/raw-query/exec";
var BOT_API_URL = "https://meridian-sap-api.shares.zrok.io/api/bot-query/exec";

var API_OPTIONS = {
  "method": "post",
  "contentType": "application/json",
  "muteHttpExceptions": true,
  "headers": { "skip_zrok_interstitial": "true" }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 Производство')
    .addItem('📥 1. Загрузить Аналитику (План/Факт)', 'showAnalyticsDialog')
    .addItem('📈 2. Детальный Дашборд (По дням)', 'buildDashboard')
    .addItem('📊 3. Общий Дашборд (Итоги + График)', 'buildAggregatedDashboard')
    .addSeparator()
    .addItem('💬 4. Подтянуть комментарии к дашборду', 'fetchAndApplyComments')
    .addSeparator()
    .addItem('📸 Создать новую версию плана (Snapshot)', 'createNewSnapshot')
    .addItem('📖 Загрузить историю версий (Логи из БД)', 'fetchVersionLogs')
    .addToUi();
}

function showAnalyticsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog')
      .setWidth(350).setHeight(400).setTitle('Загрузка Аналитики');
  SpreadsheetApp.getUi().showModalDialog(html, 'Параметры выгрузки');
}

function fetchAnalyticsData(params) {
  var query = "EXEC [dbo].[SP_GetProductionAnalytics] @DateFrom = '" + params.dateFrom + "', @DateTo = '" + params.dateTo + "', @PlanVersion = " + (params.version || "NULL");
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  var response = UrlFetchApp.fetch(API_URL, options);
  var json = JSON.parse(response.getContentText());
  
  if (!json.success || !json.data) {
    throw new Error("Ответ от SQL Server:\n" + (json.error || json.message || response.getContentText()));
  }
  
  var data = json.data;
  if(data.length === 0) return "Нет данных за этот период.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Аналитика_Данные");
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Аналитика_Данные");
  sheet.clear();

  // Добавлена колонка "Оператор" и переименован "Заказ" -> "Номер документа"
  var headers = ["Тип Данных", "Дата", "Смена", "Станок", "Номер документа", "Позиция", "Операция", "Артикул", "Оператор", "Версия Плана", "План Шт", "План Мин", "Факт Шт", "Факт Мин", "Прерывания Мин"];
  var rows = [headers];
  
  for (var i = 0; i < data.length; i++) {
    rows.push([
      data[i]["Тип Данных"], formatSqlDateRegex(data[i]["Дата"]), data[i]["Смена"], data[i]["Станок"],
      data[i]["Номер документа"] || "", data[i]["Позиция"] || "", data[i]["Операция"] || "", data[i]["Артикул"] || "",
      data[i]["Оператор"] || "",
      data[i]["Версия_Плана"],
      parseNumber(data[i]["План_Шт"]), parseNumber(data[i]["План_Время_Мин"]),
      parseNumber(data[i]["Факт_Шт"]), parseNumber(data[i]["Факт_Время_Мин"]),
      parseNumber(data[i]["Прерывания_Мин"])
    ]);
  }

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:O1").setFontWeight("bold").setBackground("#d9ead3");
  sheet.getRange(2, 2, rows.length-1, 1).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(2, 11, rows.length-1, 5).setNumberFormat("0.00");

  return "Успешно загружено строк: " + (rows.length - 1);
}

function createNewSnapshot() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Снимок Плана", "На сколько дней вперед сохранить план? (по умолчанию 30):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var days = parseInt(response.getResponseText().trim()) || 30;

  var query = "EXEC [dbo].[SP_AddPlanSnapshot] @DaysAhead = " + days;
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    if (json.success && json.data && json.data.length > 0) {
      
      var newVersion = json.data[0].NewVersion;
      var month = formatSqlDateRegex(json.data[0].Month);
      var message = json.data[0].Message;
      
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("📖 Логи Версий");
      if (!logSheet) {
        logSheet = ss.insertSheet("📖 Логи Версий");
        logSheet.appendRow(["Дата и время выгрузки", "Отчетный Месяц", "Доступная Версия (План)", "Горизонт"]);
        logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
        logSheet.setFrozenRows(1);
      }
      
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm:ss");
      logSheet.appendRow([timestamp, month, newVersion, days + " дней"]);
      logSheet.autoResizeColumns(1, 4);

      ui.alert("Успех!", message + "\nМесяц: " + month + "\nЗапись добавлена в логи.", ui.ButtonSet.OK);
    }
  } catch (e) { ui.alert("Критическая ошибка: " + e.toString()); }
}

// ---------------------------------------------------------
// ДАШБОРД 1: ДЕТАЛЬНЫЙ
// ---------------------------------------------------------
function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📈 Детальный Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(2).showTotals(true);  // Дата
  pivotTable.addRowGroup(3).showTotals(true);  // Смена
  pivotTable.addRowGroup(4).showTotals(true);  // Станок
  pivotTable.addRowGroup(8).showTotals(false); // Деталь (Артикул)

  // Новые индексы колонок из-за добавления столбца "Оператор"
  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)');
  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)');
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)');

  dashSheet.getRange("A1").setValue("Производственный Дашборд: Детальный (План / Факт / Простой)")
           .setFontSize(14).setFontWeight("bold").setFontColor("#1a73e8");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте станок (+), чтобы увидеть детализацию по артикулам")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 100); dashSheet.setColumnWidth(2, 70);
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 150);
  dashSheet.getRange("E:J").setNumberFormat('[=0]"";#,##0.##'); 
  dashSheet.getRange("G:G").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);
}

// ---------------------------------------------------------
// ДАШБОРД 2: ОБЩИЙ АГРЕГИРОВАННЫЙ
// ---------------------------------------------------------
function buildAggregatedDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📊 Общий Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(2); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(8).showTotals(true);  // Артикул
  pivotTable.addRowGroup(5).showTotals(false); // Номер документа (был "Заказ")

  // Новые индексы из-за колонки "Оператор"
  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (шт)');
  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (мин)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (мин)');
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Простой (мин)');

  dashSheet.getRange("A1").setValue("Агрегированный Дашборд: Итоги за выбранный период")
           .setFontSize(14).setFontWeight("bold").setFontColor("#b31412");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте Деталь (+), чтобы увидеть номера Документов")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 200); dashSheet.setColumnWidth(2, 130);  
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 110); 
  dashSheet.setColumnWidth(5, 100); dashSheet.setColumnWidth(6, 110); 
  dashSheet.setColumnWidth(7, 110); dashSheet.setColumnWidth(8, 130); 

  dashSheet.getRange("C:H").setNumberFormat('[=0]"";#,##0.##'); 
  dashSheet.getRange("E:E").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);

  SpreadsheetApp.flush();
  var lastRow = dashSheet.getLastRow();
  
  if (lastRow > 4) {
    var chart = dashSheet.newChart()
      .asColumnChart()
      .addRange(dashSheet.getRange(3, 1, lastRow - 3, 1))
      .addRange(dashSheet.getRange(3, 3, lastRow - 3, 2))
      .setNumHeaders(1)
      .setOption('title', 'Сравнение: План vs Факт по деталям')
      .setOption('hAxis.title', 'Артикул')
      .setOption('vAxis.title', 'Кол-во (шт)')
      .setOption('legend', {position: 'top'})
      .setOption('colors', ['#4285F4', '#34A853'])
      .setPosition(3, 10, 0, 0)
      .setOption('width', 800)
      .setOption('height', 450)
      .build();
      
    dashSheet.insertChart(chart);
  }
}

function fetchVersionLogs() {
  var ui = SpreadsheetApp.getUi();
  var query = "EXEC [dbo].[SP_GetPlanSnapshotLogs]";
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    
    if (!json.success || !json.data) throw new Error(json.error || json.message || res.getContentText());
    
    var data = json.data;
    if (data.length === 0) {
      ui.alert("В базе данных пока нет сохраненных версий.");
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("📖 Логи Версий");
    if (!logSheet) logSheet = ss.insertSheet("📖 Логи Версий");
    
    logSheet.clear();
    var rows = [["Дата и время выгрузки (в базе)", "Отчетный Месяц", "Доступная Версия (План)"]];
    for (var i = 0; i < data.length; i++) {
      var uploadDate = data[i]["Дата_Создания"] ? data[i]["Дата_Создания"].toString().replace('T', ' ').substring(0, 19) : "";
      var reportMonth = formatSqlDateRegex(data[i]["Месяц"]);
      rows.push([uploadDate, reportMonth, data[i]["Версия"]]);
    }
    
    logSheet.getRange(1, 1, rows.length, 3).setValues(rows);
    logSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#fff2cc");
    logSheet.autoResizeColumns(1, 3);
    
    ui.alert("Логи успешно восстановлены!");
  } catch (e) { ui.alert("Ошибка: " + e.toString()); }
}


// ===================================================================================
// ИНТЕГРАЦИЯ С ТЕЛЕГРАМ-БОТОМ: Сквозное 5-факторное сопоставление
// ===================================================================================
function fetchAndApplyComments() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var sheetName = sheet.getName();

  if (sheetName !== "📈 Детальный Дашборд" && sheetName !== "📊 Общий Дашборд") {
    ui.alert("Откройте '📈 Детальный Дашборд' или '📊 Общий Дашборд', чтобы загрузить комментарии.");
    return;
  }

  var rawSheet = ss.getSheetByName("Аналитика_Данные");
  if (!rawSheet) {
    ui.alert("Отсутствует лист с сырыми данными 'Аналитика_Данные'.");
    return;
  }

  try {
    // 1. Получаем логи чек-листов и комменты из БД Бота
    var query = "EXEC [dbo].[SP_GetBotComments]";
    var options = Object.assign({}, API_OPTIONS);
    options.payload = JSON.stringify({ "query": query });

    var response = UrlFetchApp.fetch(BOT_API_URL, options);
    var json = JSON.parse(response.getContentText());
    
    if (!json.success || !json.data) throw new Error(json.error || json.message || response.getContentText());
    var botComments = json.data;

    // 2. Читаем сырые данные один раз в оперативную память (для высокой скорости поиска)
    var rawValues = rawSheet.getDataRange().getValues();

    // 3. Читаем структуру текущего открытого дашборда
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var lastCol = sheet.getLastColumn();

    // Ищем/создаем колонку "Комментарии из Бота"
    var commentColIndex = -1;
    for (var c = 0; c < lastCol; c++) {
      if (values[2] && values[2][c] === "Комментарии из Бота") {
        commentColIndex = c; 
        break;
      }
    }
    if (commentColIndex === -1) {
      commentColIndex = lastCol;
      sheet.getRange(3, commentColIndex + 1).setValue("Комментарии из Бота")
           .setFontWeight("bold").setBackground("#fff2cc").setHorizontalAlignment("center");
      sheet.setColumnWidth(commentColIndex + 1, 380);
    }

    // Очищаем старые комменты
    if (sheet.getLastRow() > 3) {
      sheet.getRange(4, commentColIndex + 1, sheet.getLastRow() - 3, 1).clearContent();
    }

    var commentsToWrite = [];
    var currentDate = "";
    var currentShift = "";
    var currentMachine = "";
    var currentArticle = "";

    // 4. Идем построчно по открытой сводной таблице
    for (var i = 3; i < values.length; i++) {
      var rowComments = [];
      var isTotalRow = values[i].join("").indexOf("Всего") > -1 || values[i].join("").indexOf("Итого") > -1;

      if (!isTotalRow) {
        
        // --- ДЕТАЛЬНЫЙ ДАШБОРД ---
        if (sheetName === "📈 Детальный Дашборд") {
          var dateCell    = values[i][0]; // Дата (A)
          var shiftCell   = values[i][1]; // Смена (B)
          var machineCell = values[i][2]; // Станок (C)
          var articleCell = values[i][3]; // Артикул (D)

          if (dateCell !== "")    currentDate = formatDateValue(dateCell);
          if (shiftCell !== "")   currentShift = String(shiftCell).trim();
          if (machineCell !== "") currentMachine = String(machineCell).trim();
          var article = String(articleCell).trim();

          // Если в строке выведен артикул и это не простой станка
          if (article !== "" && article.indexOf("Общий простой") === -1) {
            
            // Находим все скрытые записи (Номер документа, Позиция, Операция, Оператор) в сыром логе
            var contexts = getContextForDetailed(rawValues, currentDate, currentShift, currentMachine, article);
            
            contexts.forEach(function(ctx) {
              // Ищем совпадения в БД бота по 5 ключам
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === currentMachine &&
                       bot.DocNumber === ctx.docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName); // Нечеткий поиск по ФИО
              });

              matched.forEach(function(m) {
                rowComments.push("👤 Оператор: " + ctx.operator + " (Док. " + ctx.docNo + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "):\n" + m.FullComment);
              });
            });
          }
        } 
        
        // --- ОБЩИЙ ДАШБОРД ---
        else if (sheetName === "📊 Общий Дашборд") {
          var articleCell = values[i][0]; // Артикул (A)
          var docCell     = values[i][1]; // Номер документа (B)

          if (articleCell !== "") currentArticle = String(articleCell).trim();
          var docNo = String(docCell).trim();

          if (docNo !== "" && docNo.indexOf("Всего") === -1 && docNo.indexOf("Общий простой") === -1) {
            
            // Вытягиваем контекст (Станок, Позиция, Операция, Оператор) по Артикулу и Документу
            var contexts = getContextForAggregated(rawValues, currentArticle, docNo);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === ctx.machine &&
                       bot.DocNumber === docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName); // 5-факторный матч
              });

              matched.forEach(function(m) {
                rowComments.push("👤 Оператор: " + ctx.operator + " (Станок " + ctx.machine + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "):\n" + m.FullComment);
              });
            });
          }
        }
      }

      commentsToWrite.push([rowComments.join("\n\n──────────────────\n\n")]);
    }

    // 5. Записываем на лист
    if (commentsToWrite.length > 0) {
      var targetRange = sheet.getRange(4, commentColIndex + 1, commentsToWrite.length, 1);
      targetRange.setValues(commentsToWrite);
      targetRange.setWrap(true);
      targetRange.setVerticalAlignment("top");
    }

    ui.alert("✅ Готово!", "Комментарии успешно сопоставлены по станкам, документам, позициям, операциям и ФИО операторов.", ui.ButtonSet.OK);

  } catch (e) {
    ui.alert("❌ Ошибка выполнения: " + e.toString());
  }
}

// ===================================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (УТИЛИТЫ)
// ===================================================================================

// Умный поиск контекста в сыром массиве по 4 параметрам (для детального отчета)
function getContextForDetailed(rawValues, targetDateStr, targetShift, targetMachine, targetArticle) {
  var results = [];
  var seenKeys = {};

  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var rawDate = formatDateValue(rawRow[1]);
    var rawShift = String(rawRow[2]).trim();
    var rawMachine = String(rawRow[3]).trim();
    var rawArticle = String(rawRow[7]).trim();
    
    if (rawDate === targetDateStr && rawShift === targetShift && rawMachine === targetMachine && rawArticle === targetArticle) {
      var docNo = String(rawRow[4]).trim();
      var posNo = String(rawRow[5]).trim();
      var opNo = String(rawRow[6]).trim();
      var operator = String(rawRow[8]).trim(); // Оператор из SAP
      
      var key = docNo + "_" + posNo + "_" + opNo + "_" + operator;
      if (!seenKeys[key] && docNo !== "" && docNo !== "Вне документа") {
        seenKeys[key] = true;
        results.push({ docNo: docNo, posNo: posNo, opNo: opNo, operator: operator });
      }
    }
  }
  return results;
}

// Умный поиск контекста в сыром массиве по Артикулу и Документу (для общего отчета)
function getContextForAggregated(rawValues, targetArticle, targetDocNo) {
  var results = [];
  var seenKeys = {};

  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var rawArticle = String(rawRow[7]).trim();
    var rawDocNo = String(rawRow[4]).trim();
    
    if (rawArticle === targetArticle && rawDocNo === targetDocNo) {
      var machine = String(rawRow[3]).trim();
      var posNo = String(rawRow[5]).trim();
      var opNo = String(rawRow[6]).trim();
      var operator = String(rawRow[8]).trim();
      
      var key = machine + "_" + posNo + "_" + opNo + "_" + operator;
      if (!seenKeys[key] && machine !== "") {
        seenKeys[key] = true;
        results.push({ machine: machine, posNo: posNo, opNo: opNo, operator: operator });
      }
    }
  }
  return results;
}

// Нечеткое сравнение имен (Веселов Е.В. <-> Веселов, Присяжный А.С. <-> Влад Присяжный)
function isNameMatch(nameSAP, nameBot) {
  if (!nameSAP || !nameBot) return false;
  
  var s = String(nameSAP).toLowerCase().trim();
  var b = String(nameBot).toLowerCase().trim();
  
  if (s === b) return true;
  
  // Убираем точки и знаки пунктуации
  var cleanS = s.replace(/[.,]/g, " ");
  var cleanB = b.replace(/[.,]/g, " ");
  
  var wordsS = cleanS.split(/\s+/).filter(Boolean);
  var wordsB = cleanB.split(/\s+/).filter(Boolean);
  
  if (wordsS.length === 0 || wordsB.length === 0) return false;
  
  // Сравниваем фамилию (обычно идет первым словом в SAP)
  var lastNameS = wordsS[0];
  var lastNameB = wordsB[0];
  
  if (lastNameS.length > 2 && lastNameS === lastNameB) return true;
  
  // На случай, если в Телеграме фамилию написали в конце (например "Влад Присяжный")
  for (var i = 0; i < wordsS.length; i++) {
    for (var j = 0; j < wordsB.length; j++) {
      if (wordsS[i].length > 3 && wordsS[i] === wordsB[j]) {
        return true;
      }
    }
  }
  
  return false;
}

// Преобразование дат в строковый формат dd.MM.yyyy
function formatDateValue(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "dd.MM.yyyy");
  }
  var s = val.toString().trim();
  var matchYmd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchYmd) {
    return matchYmd[3] + "." + matchYmd[2] + "." + matchYmd[1];
  }
  var matchDmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (matchDmy) {
    return s.substring(0, 10);
  }
  return s;
}

function formatSqlDateRegex(sqlDateStr) {
  if (!sqlDateStr) return '';
  var match = sqlDateStr.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + "." + match[2] + "." + match[1] : sqlDateStr;
}

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}
```

## Тесты

### Часть 1. Проверочные запросы из баз данных (SSMS)

Запустите эти запросы в среде SQL Server. Результаты (сетки данных) пришлите в ответном сообщении — мы проведем их детальный математический разбор.

### Запрос 1. Сырые данные Снапшота Плана (`GROSVER_GROUP`)
Этот запрос выгрузит плановые показатели до их округления и суммирования. Мы увидим исходные дробные числа и минуты по сменам.

```sql
USE [GROSVER_GROUP]
GO

SELECT 
    [Date] AS [Дата],
    [Shift] AS [Смена],
    [RESOURCE] AS [Станок],
    [BELNR_ID] AS [Номер документа],
    [BELPOS_ID] AS [Позиция],
    [POS_ID] AS [Операция],
    [ItemCode] AS [Артикул],
    [Plan_Qty_Details] AS [Исходный_План_Шт],
    CAST(ROUND([Plan_Qty_Details], 0) AS INT) AS [Округленный_План_Шт],
    [Duration] AS [Время_Плана_Мин]
FROM [dbo].[GC_PLAN_SNAPSHOT]
WHERE [Date] BETWEEN '2026-08-15' AND '2026-08-16'
ORDER BY [Date], [Shift], [RESOURCE], [Номер документа];
GO
```

### Запрос 2. Сырые данные Факта SAP (`GROSVER_GROUP`)

Этот запрос покажет физические транзакции сдачи готовой продукции из beas, которые прошли за эти два дня.

```sql
USE [GROSVER_GROUP]
GO

SELECT 
    [Date] AS [Дата],
    [Shift] AS [Смена],
    [APLATZ_ID] AS [Станок],
    [BELNR_ID] AS [Номер документа],
    [BELPOS_ID] AS [Позиция],
    [POS_ID] AS [Операция],
    [ItemCode] AS [Артикул],
    [DisplayName] AS [Оператор],
    [TYP] AS [Тип (A=Обр, R=Нал)],
    [Kol_detalej] AS [Кол-во деталей],
    DATEDIFF(MINUTE, [Start Time], [End Time]) AS [Время_Мин]
FROM [dbo].[GC_FACT_FINANCIAL_REPORT]
WHERE [Date] BETWEEN '2026-08-15' AND '2026-08-16'
ORDER BY [Date], [Shift], [APLATZ_ID], [Номер документа];
GO
```

### Запрос 3. Сырые данные Прерываний/Простоев (`GROSVER_GROUP`)

Запрос вытащит данные по простоям за 15-16 числа, которые привязаны к сменам по нашему строгому правилу (1 смена: 07:00–19:00, 2 смена: 19:00–07:00).

```sql
USE [GROSVER_GROUP]
GO

SELECT 
    APLATZ_ID AS [Станок], 
    DATUM_VON AS [Начало_Простоя], 
    DATUM_BIS AS [Конец_Простоя],
    [Продолжительность, мин] AS [Время_Простоя_Мин],
    Смена,
    Дата,
    PERS_ID_Name AS [Оператор],
    BELNR_ID AS [Номер документа],
    BELPOS_ID AS [Позиция],
    POS_ID AS [Операция]
FROM (
    SELECT 
        t0.APLATZ_ID, t10.DATUM_VON, t10.DATUM_BIS, t0.PERS_ID_Name, t1.BELNR_ID, t1.BELPOS_ID, t1.POS_ID,
        DATEDIFF(mi, t10.DATUM_VON, (CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END)) AS [Продолжительность, мин],
        CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END AS Смена,
        CASE 
            WHEN (CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END) = 1 THEN CAST(t10.DATUM_VON AS DATE)
            WHEN CAST(t10.DATUM_VON AS TIME) BETWEEN '19:00:00.0000000' AND '23:59:59.0000000' THEN CAST(t10.DATUM_VON AS DATE)
            ELSE CAST(DATEADD(day, -1, t10.DATUM_VON) AS DATE)
        END AS Дата
    FROM GC_APLATZ_STILLSTAND_BY_SHIFT t10
    LEFT JOIN BEAS_APLATZ_STILLSTAND t0 ON t10.INTNR=t0.INTNR AND t10.APLATZ_ID=t0.APLATZ_ID
    LEFT JOIN beas_arbzeit t1 ON t1.APLATZ_ID=t0.APLATZ_ID AND t0.DATUM_VON >= t1.ANFZEIT AND t0.DATUM_VON < t1.ENDZEIT 
) i
WHERE Дата BETWEEN '2026-08-15' AND '2026-08-16'
ORDER BY Дата, Смена, Станок;
GO
```

### Запрос 4. Выгрузка комментариев и чек-листов (`ChecklistBot`)

Этот запрос покажет данные из Telegram-бота, которые мы будем сопоставлять.

```sql
USE [ChecklistBot]
GO
EXEC [dbo].[SP_GetBotComments];
GO
```

# ТЕХНИЧЕСКОЕ РУКОВОДСТВО ПО ПОЛНОМУ ВОССТАНОВЛЕНИЮ СИСТЕМЫ АНАЛИТИКИ

## Часть 1. Производственная база данных (`GROSVER_GROUP`)

### 1.1. Создание таблицы снимков плана (`GC_PLAN_SNAPSHOT`)

Эта статичная таблица служит для хранения архивных версий плана (снимков), полученных из Ганта, что позволяет анализировать прошлые периоды без смещения данных.

```sql
USE [GROSVER_GROUP]
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GC_PLAN_SNAPSHOT]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[GC_PLAN_SNAPSHOT] (
        [Snapshot_ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Upload_Date] DATETIME NOT NULL,     
        [Report_Month] DATE NOT NULL,        
        [Version_Num] INT NOT NULL,          
        [PRIOR_ID] NVARCHAR(50),
        [ItemCode] NVARCHAR(50),
        [ItemName] NVARCHAR(255),
        [BELNR_ID] INT,
        [BELPOS_ID] INT,
        [POS_ID] INT,
        [RESOURCE] NVARCHAR(50),
        [Описание станка] NVARCHAR(255),
        [Shift] NVARCHAR(100),
        [Setup_Done] NVARCHAR(100),
        [VERURSACHER_AGBEZ] NVARCHAR(255),
        [VON] DATETIME,
        [BIS] DATETIME,
        [Duration] FLOAT,
        [MENGE] FLOAT,
        [Plan_Qty_Details] FLOAT,
        [TEAPLATZ] FLOAT,
        [TRAPLATZ] FLOAT,
        [gc_intensity_fact] FLOAT,
        [TEAPLATZ_ALT] FLOAT,
        [Remainder_Order] FLOAT,
        [Price_for_1_min] FLOAT,
        [Narabotka_plan] FLOAT,
        [Date] DATE
    )
END
GO
```

### 1.2. Создание консолидирующего аналитического представления (`VW_PRODUCTION_ANALYTICS`)

Объединяет три независимых источника (план, факт и простои) в единую плоскую структуру. Все числовые показатели округляются до целых чисел (`INT`) на уровне СУБД.

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.VW_PRODUCTION_ANALYTICS', 'V') IS NOT NULL
    DROP VIEW dbo.VW_PRODUCTION_ANALYTICS;
GO

CREATE VIEW [dbo].[VW_PRODUCTION_ANALYTICS] AS

-- =========================================================================
-- 1. СРЕЗ: ПЛАН (Тип Работы определяется по отметке наладки на Ганте)
-- =========================================================================
SELECT 
    N'План' AS [Тип Данных],
    CONVERT(DATE, RIGHT(RTRIM(p.[Shift]), 10), 104) AS [Дата],
    CAST(LEFT(RTRIM(p.[Shift]), 1) AS INT) AS [Смена],
    RTRIM(LTRIM(p.RESOURCE)) AS [Станок],
    RTRIM(LTRIM(CAST(p.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа],
    RTRIM(LTRIM(CAST(p.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(p.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(p.ItemCode)) AS [Артикул],
    NULL AS [Оператор],
    CASE WHEN p.Setup_Done LIKE N'%наладка%' THEN N'Наладка' ELSE N'Обработка' END AS [Тип Работы], 
    p.[Version_Num] AS [Версия_Плана],
    CAST(ROUND(ISNULL(p.Plan_Qty_Details, 0), 0) AS INT) AS [План_Шт],
    CAST(ROUND(ISNULL(p.Duration, 0), 0) AS INT) AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_PLAN_SNAPSHOT] p

UNION ALL

-- =========================================================================
-- 2. СРЕЗ: ФАКТ (Тип Работы определяется на основе флага TYP из Beas)
-- =========================================================================
SELECT 
    CASE WHEN f.Kol_detalej < 0 THEN N'Факт (Брак/Сторно)' ELSE N'Факт' END AS [Тип Данных],
    f.Date AS [Дата],
    CAST(f.[Shift] AS INT) AS [Смена],
    RTRIM(LTRIM(f.APLATZ_ID)) AS [Станок],
    RTRIM(LTRIM(CAST(f.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа],
    RTRIM(LTRIM(CAST(f.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(f.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(f.ItemCode)) AS [Артикул],
    RTRIM(LTRIM(f.DisplayName)) AS [Оператор],
    CASE WHEN f.TYP = 'R' THEN N'Наладка' ELSE N'Обработка' END AS [Тип Работы], 
    0 AS [Версия_Плана],
    0 AS [План_Шт],
    0 AS [План_Время_Мин],
    CAST(ROUND(CASE WHEN f.Kol_detalej > 0 THEN f.Kol_detalej ELSE 0 END, 0) AS INT) AS [Факт_Шт],
    CAST(ROUND(CASE WHEN f.[End Time] >= f.[Start Time] THEN DATEDIFF(MINUTE, f.[Start Time], f.[End Time]) ELSE 0 END, 0) AS INT) AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_FACT_FINANCIAL_REPORT] f
WHERE f.[Start Time] IS NOT NULL AND f.[End Time] IS NOT NULL

UNION ALL

-- =========================================================================
-- 3. СРЕЗ: ПРЕРЫВАНИЯ (Прерывания_Мин округляются до целых минут)
-- =========================================================================
SELECT 
    N'Прерывание' AS [Тип Данных],
    i.Дата AS [Дата],
    CAST(i.Смена AS INT) AS [Смена],
    RTRIM(LTRIM(i.APLATZ_ID)) AS [Станок],
    ISNULL(RTRIM(LTRIM(CAST(i.BELNR_ID AS NVARCHAR(50)))), N'Вне документа') AS [Номер документа],
    ISNULL(RTRIM(LTRIM(CAST(i.BELPOS_ID AS NVARCHAR(50)))), N'-') AS [Позиция],
    ISNULL(RTRIM(LTRIM(CAST(i.POS_ID AS NVARCHAR(50)))), N'-') AS [Операция],
    ISNULL(RTRIM(LTRIM(i.ItemCode)), N'Общий простой станка') AS [Артикул],
    RTRIM(LTRIM(i.PERS_ID_Name)) AS [Оператор],
    N'Прерывание' AS [Тип Работы],
    0 AS [Версия_Плана],
    0 AS [План_Шт],
    0 AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    CAST(ROUND(ISNULL(i.[Продолжительность, мин], 0), 0) AS INT) AS [Прерывания_Мин]
FROM (
    SELECT t0.*
    FROM (
        SELECT 
            t0.APLATZ_ID, t10.DATUM_VON, t10.DATUM_BIS, t0.PERS_ID_Name, t1.BELNR_ID, t1.BELPOS_ID, t1.POS_ID,
            DATEDIFF(mi, t10.DATUM_VON, (CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END)) AS [Продолжительность, мин],
            CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END AS Смена,
            CASE 
                WHEN (CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END) = 1 THEN CAST(t10.DATUM_VON AS DATE)
                WHEN CAST(t10.DATUM_VON AS TIME) BETWEEN '19:00:00.0000000' AND '23:59:59.0000000' THEN CAST(t10.DATUM_VON AS DATE)
                ELSE CAST(DATEADD(day, -1, t10.DATUM_VON) AS DATE)
            END AS Дата
        FROM GC_APLATZ_STILLSTAND_BY_SHIFT t10
        LEFT JOIN BEAS_APLATZ_STILLSTAND t0 ON t10.INTNR = t0.INTNR AND t10.APLATZ_ID = t0.APLATZ_ID
        LEFT JOIN beas_arbzeit t1 ON t1.APLATZ_ID = t0.APLATZ_ID AND t0.DATUM_VON >= t1.ANFZEIT AND t0.DATUM_VON < t1.ENDZEIT 
        LEFT JOIN BEAS_FTPOS t2 ON t2.BELNR_ID = t1.BELNR_ID AND t2.BELPOS_ID = t1.BELPOS_ID 
        LEFT JOIN OITM t3 ON t3.ItemCode = (CASE WHEN t2.ItemCode LIKE '2101%' THEN '4301'+SUBSTRING(t2.ItemCode, 5,7) ELSE t2.ItemCode END)
        LEFT JOIN BEAS_FTHAUPT t4 ON t4.BELNR_ID = t1.BELNR_ID
        LEFT JOIN BEAS_APLATZ t5 ON t5.APLATZ_ID = t0.APLATZ_ID
        LEFT JOIN BEAS_STILLSTANDGRUND t6 ON t6.GRUNDID = t0.GRUNDID
        WHERE t10.DATUM_VON >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1) 
          AND t10.DATUM_VON < t10.DATUM_BIS
          AND t10.APLATZ_ID IN (SELECT APLATZ_ID FROM BEAS_APLATZ WHERE Active = 'J' AND GRUPPE IN ('Lathes', 'Milling') AND (APLATZ_ID NOT IN ('L02', 'L05', 'L08', 'L11', 'M04', 'M08', 'Mill', 'Turning')))
    ) t0
    WHERE t0.DATUM_VON < t0.End_Date
) i;
GO
```

### 1.3. Хранимые процедуры

#### Хранимая процедура `SP_AddPlanSnapshot`

Выполняет автоматическое считывание текущего Ганта и фиксирует его в статическую таблицу с автоматическим расчетом номера версии.

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_AddPlanSnapshot', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_AddPlanSnapshot;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_AddPlanSnapshot]
    @DaysAhead INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CurrentMonth DATE = DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0);
    DECLARE @NextVersion INT = ISNULL((SELECT MAX([Version_Num]) FROM [dbo].[GC_PLAN_SNAPSHOT] WHERE [Report_Month] = @CurrentMonth), 0) + 1;

    -- Создаем временную таблицу, строго соответствующую выходу оригинальной процедуры
    CREATE TABLE #TempPlan (
        [PRIOR_ID] NVARCHAR(50), [ItemCode] NVARCHAR(50), [ItemName] NVARCHAR(255),
        [BELNR_ID] INT, [BELPOS_ID] INT, [POS_ID] INT, [RESOURCE] NVARCHAR(50),
        [Описание станка] NVARCHAR(255), [Shift] NVARCHAR(100), [Setup_Done] NVARCHAR(100),
        [VERURSACHER_AGBEZ] NVARCHAR(255), [VON] DATETIME, [BIS] DATETIME,
        [Duration] FLOAT, [MENGE] FLOAT, [Plan_Qty_Details] FLOAT, [TEAPLATZ] FLOAT,
        [TRAPLATZ] FLOAT, [gc_intensity_fact] FLOAT, [TEAPLATZ_ALT] FLOAT,
        [Remainder_Order] FLOAT, [Price_for_1_min] FLOAT, [Narabotka_plan] FLOAT, [Date] DATE
    );

    -- Вызываем оригинальную процедуру, рассчитывающую распределение по сменам
    INSERT INTO #TempPlan EXEC [dbo].[GetPlanReportForExell] @DaysAhead = @DaysAhead;

    -- Копируем данные в постоянную таблицу с добавлением даты и версии
    INSERT INTO [dbo].[GC_PLAN_SNAPSHOT] (
        [Upload_Date], [Report_Month], [Version_Num], [PRIOR_ID], [ItemCode], [ItemName], 
        [BELNR_ID], [BELPOS_ID], [POS_ID], [RESOURCE], [Описание станка], [Shift], 
        [Setup_Done], [VERURSACHER_AGBEZ], [VON], [BIS], [Duration], [MENGE], 
        [Plan_Qty_Details], [TEAPLATZ], [TRAPLATZ], [gc_intensity_fact], [TEAPLATZ_ALT], 
        [Remainder_Order], [Price_for_1_min], [Narabotka_plan], [Date]
    )
    SELECT GETDATE(), @CurrentMonth, @NextVersion, * FROM #TempPlan;

    DROP TABLE #TempPlan;

    SELECT @NextVersion AS [NewVersion], @CurrentMonth AS [Month], N'Успешно создана Версия ' + CAST(@NextVersion AS NVARCHAR) AS [Message];
END
GO
```

#### Хранимая процедура `SP_GetProductionAnalytics`

Обеспечивает выгрузку консолидированных данных по API. Используется Google Apps Script.

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_GetProductionAnalytics', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_GetProductionAnalytics;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetProductionAnalytics]
    @DateFrom DATE,
    @DateTo DATE,
    @PlanVersion INT = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Если версия не указана, берем самую свежую сохраненную версию за месяц начала периода
    IF @PlanVersion IS NULL OR @PlanVersion = 0
    BEGIN
        DECLARE @Month DATE = DATEADD(month, DATEDIFF(month, 0, @DateFrom), 0);
        SET @PlanVersion = ISNULL((SELECT MAX([Version_Num]) FROM [dbo].[GC_PLAN_SNAPSHOT] WHERE [Report_Month] = @Month), 1);
    END

    SELECT 
        [Тип Данных], 
        [Дата], 
        [Смена], 
        [Станок], 
        [Номер документа], 
        [Позиция], 
        [Операция], 
        [Артикул], 
        [Оператор],
        [Тип Работы], 
        [Версия_Плана], 
        [План_Шт], 
        [План_Время_Мин], 
        [Факт_Шт], 
        [Факт_Время_Мин],
        [Прерывания_Мин]
    FROM [dbo].[VW_PRODUCTION_ANALYTICS]
    WHERE [Дата] >= @DateFrom AND [Дата] <= @DateTo
      AND ([Версия_Плана] = @PlanVersion OR [Версия_Плана] = 0)
    ORDER BY [Дата], [Смена], [Станок];
END
GO
```

#### Хранимая процедура `SP_GetPlanSnapshotLogs`

Выгружает список всех когда-либо сохраненных версий плана.

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.SP_GetPlanSnapshotLogs', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_GetPlanSnapshotLogs;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetPlanSnapshotLogs]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MAX(Upload_Date) AS [Дата_Создания], 
        Report_Month AS [Месяц], 
        Version_Num AS [Версия] 
    FROM [dbo].[GC_PLAN_SNAPSHOT] 
    GROUP BY Report_Month, Version_Num 
    ORDER BY Report_Month DESC, Version_Num DESC;
END
GO
```

---

## Часть 2. База данных Telegram-бота (`ChecklistBot`)

Выполняйте эти скрипты в СУБД бота.

### 2.1. Хранимая процедура `SP_GetBotComments`

Агрегирует данные чек-листов и текстовых комментариев, объединяя их по станкам, деталям, документам, позициям и ФИО.

```sql
USE [ChecklistBot]
GO

IF OBJECT_ID('dbo.SP_GetBotComments', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_GetBotComments;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetBotComments] AS
BEGIN
    SET NOCOUNT ON;
    
    WITH AllLogs AS (
        SELECT 
            r.MachineCode, 
            CAST(r.PartNumber AS NVARCHAR(50)) AS PartNumber,
            CAST(r.DocNumber AS NVARCHAR(50)) AS DocNumber, 
            CAST(r.DocPosition AS NVARCHAR(50)) AS DocPosition, 
            CAST(r.OperationNumber AS NVARCHAR(50)) AS OperationNumber,
            RTRIM(LTRIM(r.AuthorFullName)) AS AuthorFullName,
            RTRIM(LTRIM(r.OperationType)) AS OperationType,
            CONCAT(N'🛠 [', FORMAT(r.CreatedAt, 'dd.MM HH:mm'), N'] Чек-лист: ', q.Text, N' - ', CASE WHEN a.IsOk = 1 THEN N'ОК' ELSE N'НЕ ОК' END, ISNULL(N' (' + a.Note + N')', N'')) AS LogText, 
            r.CreatedAt
        FROM [dbo].[ToolReports] r 
        JOIN [dbo].[ToolReportAnswers] a ON r.Id = a.ReportId 
        JOIN [dbo].[ToolQuestions] q ON a.QuestionId = q.Id
        
        UNION ALL
        
        SELECT 
            c.MachineCode, 
            CAST(c.PartNumber AS NVARCHAR(50)) AS PartNumber,
            CAST(c.DocNumber AS NVARCHAR(50)), 
            CAST(c.DocPosition AS NVARCHAR(50)), 
            CAST(c.OperationNumber AS NVARCHAR(50)),
            RTRIM(LTRIM(c.AuthorFullName)) AS AuthorFullName,
            RTRIM(LTRIM(c.OperationType)) AS OperationType,
            CONCAT(N'💬 [', FORMAT(c.CreatedAt, 'dd.MM HH:mm'), N'] Коммент: ', c.Message), 
            c.CreatedAt
        FROM [dbo].[Checklists] c
    )
    SELECT 
        RTRIM(LTRIM(MachineCode)) AS MachineCode, 
        RTRIM(LTRIM(PartNumber)) AS PartNumber,
        RTRIM(LTRIM(DocNumber)) AS DocNumber, 
        RTRIM(LTRIM(DocPosition)) AS DocPosition, 
        RTRIM(LTRIM(OperationNumber)) AS OperationNumber,
        RTRIM(LTRIM(AuthorFullName)) AS AuthorFullName,
        RTRIM(LTRIM(OperationType)) AS OperationType,
        STRING_AGG(LogText, CHAR(10)) WITHIN GROUP (ORDER BY CreatedAt) AS FullComment
    FROM AllLogs 
    GROUP BY MachineCode, PartNumber, DocNumber, DocPosition, OperationNumber, AuthorFullName, OperationType;
END
GO
```

---

## Часть 3. Google Apps Script

Создайте новую таблицу Google Sheets, откройте **Расширения** -> **Apps Script** и создайте два файла с указанным кодом.

### 3.1. Файл `Code.gs`

```javascript
var API_URL = "https://meridian-sap-api.shares.zrok.io/api/raw-query/exec";
var BOT_API_URL = "https://meridian-sap-api.shares.zrok.io/api/bot-query/exec";

var API_OPTIONS = {
  "method": "post",
  "contentType": "application/json",
  "muteHttpExceptions": true,
  "headers": { "skip_zrok_interstitial": "true" }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 Производство')
    .addItem('📥 1. Загрузить Аналитику (План/Факт)', 'showAnalyticsDialog')
    .addItem('📈 2. Детальный Дашборд (По дням)', 'buildDashboard')
    .addItem('📊 3. Общий Дашборд (Итоги + График)', 'buildAggregatedDashboard')
    .addSeparator()
    .addItem('💬 4. Подтянуть комментарии к дашборду', 'fetchAndApplyComments')
    .addSeparator()
    .addItem('📸 Создать новую версию плана (Snapshot)', 'createNewSnapshot')
    .addItem('📖 Загрузить историю версий (Логи из БД)', 'fetchVersionLogs')
    .addToUi();
}

function showAnalyticsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog')
      .setWidth(350).setHeight(400).setTitle('Загрузка Аналитики');
  SpreadsheetApp.getUi().showModalDialog(html, 'Параметры выгрузки');
}

function fetchAnalyticsData(params) {
  var query = "EXEC [dbo].[SP_GetProductionAnalytics] @DateFrom = '" + params.dateFrom + "', @DateTo = '" + params.dateTo + "', @PlanVersion = " + (params.version || "NULL");
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  var response = UrlFetchApp.fetch(API_URL, options);
  var json = JSON.parse(response.getContentText());
  
  if (!json.success || !json.data) {
    throw new Error("Ответ от SQL Server:\n" + (json.error || json.message || response.getContentText()));
  }
  
  var data = json.data;
  if(data.length === 0) return "Нет данных за этот период.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Аналитика_Данные");
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Аналитика_Данные");
  sheet.clear();

  var headers = ["Тип Данных", "Дата", "Смена", "Станок", "Номер документа", "Позиция", "Операция", "Артикул", "Оператор", "Тип Работы", "Версия Плана", "План Шт", "План Мин", "Факт Шт", "Факт Мин", "Прерывания Мин"];
  var rows = [headers];
  
  for (var i = 0; i < data.length; i++) {
    rows.push([
      data[i]["Тип Данных"], formatSqlDateRegex(data[i]["Дата"]), data[i]["Смена"], data[i]["Станок"],
      data[i]["Номер документа"] || "", data[i]["Позиция"] || "", data[i]["Операция"] || "", data[i]["Артикул"] || "",
      data[i]["Оператор"] || "", data[i]["Тип Работы"] || "", data[i]["Версия_Плана"],
      parseNumber(data[i]["План_Шт"]), parseNumber(data[i]["План_Время_Мин"]),
      parseNumber(data[i]["Факт_Шт"]), parseNumber(data[i]["Факт_Время_Мин"]),
      parseNumber(data[i]["Прерывания_Мин"])
    ]);
  }

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:P1").setFontWeight("bold").setBackground("#d9ead3");
  sheet.getRange(2, 2, rows.length-1, 1).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(2, 12, rows.length-1, 5).setNumberFormat("0");

  return "Успешно загружено строк: " + (rows.length - 1);
}

function createNewSnapshot() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Снимок Плана", "На сколько дней вперед сохранить план? (по умолчанию 30):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var days = parseInt(response.getResponseText().trim()) || 30;

  var query = "EXEC [dbo].[SP_AddPlanSnapshot] @DaysAhead = " + days;
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    if (json.success && json.data && json.data.length > 0) {
      
      var newVersion = json.data[0].NewVersion;
      var month = formatSqlDateRegex(json.data[0].Month);
      var message = json.data[0].Message;
      
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("📖 Логи Версий");
      if (!logSheet) {
        logSheet = ss.insertSheet("📖 Логи Версий");
        logSheet.appendRow(["Дата и время выгрузки", "Отчетный Месяц", "Доступная Версия (План)", "Горизонт"]);
        logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
        logSheet.setFrozenRows(1);
      }
      
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm:ss");
      logSheet.appendRow([timestamp, month, newVersion, days + " дней"]);
      logSheet.autoResizeColumns(1, 4);

      ui.alert("Успех!", message + "\nМесяц: " + month + "\nЗапись добавлена в логи.", ui.ButtonSet.OK);
    }
  } catch (e) { ui.alert("Критическая ошибка: " + e.toString()); }
}

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📈 Детальный Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(2).showTotals(true);  
  pivotTable.addRowGroup(3).showTotals(true);  
  pivotTable.addRowGroup(4).showTotals(true);  
  pivotTable.addRowGroup(8).showTotals(false); 

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)');
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)');
  pivotTable.addPivotValue(16, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)');

  dashSheet.getRange("A1").setValue("Производственный Дашборд: Детальный (План / Факт / Простой)")
           .setFontSize(14).setFontWeight("bold").setFontColor("#1a73e8");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте станок (+), чтобы увидеть детализацию по артикулам")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 100); dashSheet.setColumnWidth(2, 70);
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 150);
  dashSheet.getRange("E:J").setNumberFormat('[=0]"";#,##0'); 
  dashSheet.getRange("G:G").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);
}

function buildAggregatedDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📊 Общий Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(2); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(8).showTotals(true);  
  pivotTable.addRowGroup(5).showTotals(false); 

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (шт)'); 
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (шт)'); 
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (мин)'); 
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (мин)'); 
  pivotTable.addPivotValue(16, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Простой (мин)'); 

  dashSheet.getRange("A1").setValue("Агрегированный Дашборд: Итоги за выбранный период")
           .setFontSize(14).setFontWeight("bold").setFontColor("#b31412");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте Деталь (+), чтобы увидеть номера Документов")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 200); dashSheet.setColumnWidth(2, 130);  
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 110); 
  dashSheet.setColumnWidth(5, 100); dashSheet.setColumnWidth(6, 110); 
  dashSheet.setColumnWidth(7, 110); dashSheet.setColumnWidth(8, 130); 

  dashSheet.getRange("C:H").setNumberFormat('[=0]"";#,##0'); 
  dashSheet.getRange("E:E").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);

  SpreadsheetApp.flush();
  var lastRow = dashSheet.getLastRow();
  
  if (lastRow > 4) {
    var chart = dashSheet.newChart()
      .asColumnChart()
      .addRange(dashSheet.getRange(3, 1, lastRow - 3, 1))
      .addRange(dashSheet.getRange(3, 3, lastRow - 3, 2))
      .setNumHeaders(1)
      .setOption('title', 'Сравнение: План vs Факт по деталям')
      .setOption('hAxis.title', 'Артикул')
      .setOption('vAxis.title', 'Кол-во (шт)')
      .setOption('legend', {position: 'top'})
      .setOption('colors', ['#4285F4', '#34A853'])
      .setPosition(3, 10, 0, 0)
      .setOption('width', 800)
      .setOption('height', 450)
      .build();
      
    dashSheet.insertChart(chart);
  }
}

function fetchVersionLogs() {
  var ui = SpreadsheetApp.getUi();
  var query = "EXEC [dbo].[SP_GetPlanSnapshotLogs]";
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    
    if (!json.success || !json.data) throw new Error(json.error || json.message || res.getContentText());
    
    var data = json.data;
    if (data.length === 0) {
      ui.alert("В базе данных пока нет сохраненных версий.");
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("📖 Логи Версий");
    if (!logSheet) logSheet = ss.insertSheet("📖 Логи Версий");
    
    logSheet.clear();
    var rows = [["Дата и время выгрузки (в базе)", "Отчетный Месяц", "Доступная Версия (План)"]];
    for (var i = 0; i < data.length; i++) {
      var uploadDate = data[i]["Дата_Создания"] ? data[i]["Дата_Создания"].toString().replace('T', ' ').substring(0, 19) : "";
      var reportMonth = formatSqlDateRegex(data[i]["Месяц"]);
      rows.push([uploadDate, reportMonth, data[i]["Версия"]]);
    }
    
    logSheet.getRange(1, 1, rows.length, 3).setValues(rows);
    logSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#fff2cc");
    logSheet.autoResizeColumns(1, 3);
    
    ui.alert("Логи успешно восстановлены!");
  } catch (e) { ui.alert("Ошибка: " + e.toString()); }
}

// ===================================================================================
// ИНТЕГРАЦИЯ С ТЕЛЕГРАМ-БОТОМ: Сквозное сопоставление по 5 ключам + тип обработки
// ===================================================================================
function fetchAndApplyComments() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var sheetName = sheet.getName();

  if (sheetName !== "📈 Детальный Дашборд" && sheetName !== "📊 Общий Дашборд") {
    ui.alert("Откройте '📈 Детальный Дашборд' или '📊 Общий Дашборд', чтобы загрузить комментарии.");
    return;
  }

  var rawSheet = ss.getSheetByName("Аналитика_Данные");
  if (!rawSheet) {
    ui.alert("Отсутствует лист с сырыми данными 'Аналитика_Данные'.");
    return;
  }

  try {
    var query = "EXEC [dbo].[SP_GetBotComments]";
    var options = Object.assign({}, API_OPTIONS);
    options.payload = JSON.stringify({ "query": query });

    var response = UrlFetchApp.fetch(BOT_API_URL, options);
    var json = JSON.parse(response.getContentText());
    
    if (!json.success || !json.data) throw new Error(json.error || json.message || response.getContentText());
    var botComments = json.data;

    var rawValues = rawSheet.getDataRange().getValues();

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var lastCol = sheet.getLastColumn();

    var commentColIndex = -1;
    for (var c = 0; c < lastCol; c++) {
      if (values[2] && values[2][c] === "Комментарии из Бота") {
        commentColIndex = c; 
        break;
      }
    }
    if (commentColIndex === -1) {
      commentColIndex = lastCol;
      sheet.getRange(3, commentColIndex + 1).setValue("Комментарии из Бота")
           .setFontWeight("bold").setBackground("#fff2cc").setHorizontalAlignment("center");
      sheet.setColumnWidth(commentColIndex + 1, 380);
    }

    if (sheet.getLastRow() > 3) {
      sheet.getRange(4, commentColIndex + 1, sheet.getLastRow() - 3, 1).clearContent();
    }

    var commentsToWrite = [];
    var currentDate = "";
    var currentShift = "";
    var currentMachine = "";
    var currentArticle = "";

    for (var i = 3; i < values.length; i++) {
      var rowComments = [];
      var isTotalRow = values[i].join("").indexOf("Всего") > -1 || values[i].join("").indexOf("Итого") > -1;

      if (!isTotalRow) {
        
        // --- ДЕТАЛЬНЫЙ ДАШБОРД ---
        if (sheetName === "📈 Детальный Дашборд") {
          var dateCell    = values[i][0]; 
          var shiftCell   = values[i][1]; 
          var machineCell = values[i][2]; 
          var articleCell = values[i][3]; 

          if (dateCell !== "")    currentDate = formatDateValue(dateCell);
          if (shiftCell !== "")   currentShift = String(shiftCell).trim();
          if (machineCell !== "") currentMachine = String(machineCell).trim();
          var article = String(articleCell).trim();

          if (article !== "" && article.indexOf("Общий простой") === -1) {
            var contexts = getContextForDetailed(rawValues, currentDate, currentShift, currentMachine, article);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === currentMachine &&
                       bot.DocNumber === ctx.docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) &&
                       bot.OperationType === ctx.opType;
              });

              matched.forEach(function(m) {
                // ИЗМЕНЕНИЕ: Убираем переносы строк \n внутри комментария и заменяем на горизонтальный разделитель
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, "  |  ");
                rowComments.push("👤 Оператор: " + ctx.operator + " (" + ctx.opType + ") (Док. " + ctx.docNo + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "): " + singleLineComment);
              });
            });
          }
        } 
        
        // --- ОБЩИЙ ДАШБОРД ---
        else if (sheetName === "📊 Общий Дашборд") {
          var articleCell = values[i][0]; 
          var docCell     = values[i][1]; 

          if (articleCell !== "") currentArticle = String(articleCell).trim();
          var docNo = String(docCell).trim();

          if (docNo !== "" && docNo.indexOf("Всего") === -1 && docNo.indexOf("Общий простой") === -1) {
            var contexts = getContextForAggregated(rawValues, currentArticle, docNo);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === ctx.machine &&
                       bot.DocNumber === docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) &&
                       bot.OperationType === ctx.opType;
              });

              matched.forEach(function(m) {
                // ИЗМЕНЕНИЕ: Убираем переносы строк \n внутри комментария и заменяем на горизонтальный разделитель
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, "  |  ");
                rowComments.push("👤 " + ctx.operator + " (" + ctx.opType + ") (Станок " + ctx.machine + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "): " + singleLineComment);
              });
            });
          }
        }
      }

      // ИЗМЕНЕНИЕ: Объединяем разные логи/комментарии в одну строчку через красивый разделитель " ◆ " без переносов строк \n
      commentsToWrite.push([rowComments.join("   ◆   ")]);
    }

    if (commentsToWrite.length > 0) {
      var targetRange = sheet.getRange(4, commentColIndex + 1, commentsToWrite.length, 1);
      targetRange.setValues(commentsToWrite);
      
      // 1. Включаем обрезку текста по границе ячейки (CLIP)
      targetRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      targetRange.setVerticalAlignment("center");
      
      // 2. СБРОС ВЫСОТЫ СТРОК: Принудительно возвращаем высоту строк в стандартные 20 пикселей.
      var numRows = sheet.getLastRow() - 3;
      if (numRows > 0) {
        sheet.setRowHeights(4, numRows, 20); 
      }
    }

    ui.alert("✅ Готово!", "Комментарии успешно сопоставлены по станкам, документам, позициям, операциям, ФИО и типу работы.", ui.ButtonSet.OK);

  } catch (e) {
    ui.alert("❌ Ошибка выполнения: " + e.toString());
  }
}

function getContextForDetailed(rawValues, targetDateStr, targetShift, targetMachine, targetArticle) {
  var results = [];
  var seenKeys = {};

  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var rawDate = formatDateValue(rawRow[1]);
    var rawShift = String(rawRow[2]).trim();
    var rawMachine = String(rawRow[3]).trim(); 
    var rawArticle = String(rawRow[7]).trim(); 
    
    if (rawDate === targetDateStr && rawShift === targetShift && rawMachine === targetMachine && rawArticle === targetArticle) {
      var docNo = String(rawRow[4]).trim();
      var posNo = String(rawRow[5]).trim();
      var opNo = String(rawRow[6]).trim();
      var operator = String(rawRow[8]).trim();
      var opType = String(rawRow[9]).trim(); 
      
      var key = docNo + "_" + posNo + "_" + opNo + "_" + operator + "_" + opType;
      if (!seenKeys[key] && docNo !== "" && docNo !== "Вне документа") {
        seenKeys[key] = true;
        results.push({ docNo: docNo, posNo: posNo, opNo: opNo, operator: operator, opType: opType });
      }
    }
  }
  return results;
}

function getContextForAggregated(rawValues, targetArticle, targetDocNo) {
  var results = [];
  var seenKeys = {};

  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var rawArticle = String(rawRow[7]).trim();
    var rawDocNo = String(rawRow[4]).trim();
    
    if (rawArticle === targetArticle && rawDocNo === targetDocNo) {
      var machine = String(rawRow[3]).trim();
      var posNo = String(rawRow[5]).trim();
      var opNo = String(rawRow[6]).trim();
      var operator = String(rawRow[8]).trim();
      var opType = String(rawRow[9]).trim(); 
      
      var key = machine + "_" + posNo + "_" + opNo + "_" + operator + "_" + opType;
      if (!seenKeys[key] && machine !== "") {
        seenKeys[key] = true;
        results.push({ machine: machine, posNo: posNo, opNo: opNo, operator: operator, opType: opType });
      }
    }
  }
  return results;
}

function isNameMatch(nameSAP, nameBot) {
  if (!nameSAP || !nameBot) return false;
  
  var s = String(nameSAP).toLowerCase().trim();
  var b = String(nameBot).toLowerCase().trim();
  
  if (s === b) return true;
  
  var cleanS = s.replace(/[.,]/g, " ");
  var cleanB = b.replace(/[.,]/g, " ");
  
  var wordsS = cleanS.split(/\s+/).filter(Boolean);
  var wordsB = cleanB.split(/\s+/).filter(Boolean);
  
  if (wordsS.length === 0 || wordsB.length === 0) return false;
  
  var lastNameS = wordsS[0];
  var lastNameB = wordsB[0];
  
  if (lastNameS.length > 2 && lastNameS === lastNameB) return true;
  
  for (var i = 0; i < wordsS.length; i++) {
    for (var j = 0; j < wordsB.length; j++) {
      if (wordsS[i].length > 3 && wordsS[i] === wordsB[j]) {
        return true;
      }
    }
  }
  
  return false;
}

function formatDateValue(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "dd.MM.yyyy");
  }
  var s = val.toString().trim();
  var matchYmd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchYmd) {
    return matchYmd[3] + "." + matchYmd[2] + "." + matchYmd[1];
  }
  var matchDmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (matchDmy) {
    return s.substring(0, 10);
  }
  return s;
}

function formatSqlDateRegex(sqlDateStr) {
  if (!sqlDateStr) return '';
  var match = sqlDateStr.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + "." + match[2] + "." + match[1] : sqlDateStr;
}

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}
```

### 3.2. Файл `Dialog.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 20px; background-color: #f8f9fa; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; color: #333; font-size: 14px; }
      input[type="date"], input[type="number"] { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
      .btn { background-color: #1a73e8; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; font-size: 14px; }
      .btn:hover { background-color: #1557b0; }
      #status { margin-top: 15px; font-size: 13px; color: #d93025; text-align: center; }
      .spinner { display: none; margin: 0 auto; border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="form-group">
      <label>Дата С (От):</label>
      <input type="date" id="dateFrom" required>
    </div>
    <div class="form-group">
      <label>Дата По (До):</label>
      <input type="date" id="dateTo" required>
    </div>
    <div class="form-group">
      <label>Версия Плана (0 = Последняя):</label>
      <input type="number" id="version" value="0" min="0">
    </div>
    
    <button class="btn" onclick="submitForm()">Загрузить Аналитику</button>
    
    <div style="margin-top: 15px; text-align: center;">
      <div class="spinner" id="spinner"></div>
      <div id="status"></div>
    </div>

    <script>
      var d = new Date();
      document.getElementById('dateFrom').value = new Date(d.getFullYear(), d.getMonth(), 2).toISOString().split('T')[0];
      document.getElementById('dateTo').value = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0];

      function submitForm() {
        document.getElementById('spinner').style.display = 'block';
        document.getElementById('status').innerText = 'Загрузка с сервера...';
        var params = {
          dateFrom: document.getElementById('dateFrom').value,
          dateTo: document.getElementById('dateTo').value,
          version: document.getElementById('version').value
        };
        google.script.run
          .withSuccessHandler(function(res) {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('status').style.color = '#188038';
            document.getElementById('status').innerText = res;
            setTimeout(function() { google.script.host.close(); }, 1500);
          })
          .withFailureHandler(function(err) {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('status').style.color = '#d93025';
            document.getElementById('status').innerText = err.message;
          })
          .fetchAnalyticsData(params);
      }
    </script>
  </body>
</html>
```

---

## Часть 4. Инструкция по развертыванию при аварийном восстановлении

Если база данных или Google Таблица были полностью уничтожены, выполните следующие действия:

1. **Развертывание баз данных:**
   * В СУБД на сервере SAP B1 создайте пустую таблицу снимков и выполните код из глав `1.1`, `1.2` и `1.3` (база `GROSVER_GROUP`).
   * В СУБД на сервере Telegram-бота откройте базу данных `ChecklistBot` и создайте процедуру из главы `2.1`.
2. **Создание новой Google Таблицы:**
   * Создайте пустую книгу Google Таблиц.
   * Откройте меню **Расширения** -> **Apps Script**.
   * Создайте файл скрипта `Code.gs` и скопируйте туда код из главы `3.1`.
   * Создайте HTML-файл, назовите его ровно `Dialog` (Google автоматически добавит расширение `.html`), и скопируйте туда код из главы `3.2`.
   * Перезагрузите страницу Google Таблицы. В верхнем меню появится пункт **`🏭 Производство`**.
3. **Первичный импорт данных:**
   * Сделайте первый снимок текущего плана: **`🏭 Производство`** -> **`📸 Создать новую версию плана (Snapshot)`**.
   * Импортируйте данные: **`🏭 Производство`** -> **`📥 1. Загрузить Аналитику (План/Факт)`** (будет автоматически создан лист `Аналитика_Данные`).
   * Сформируйте дашборды: выберите пункты **`2`** и **`3`** в меню.
   * Нажмите **`💬 4. Подтянуть комментарии к дашборду`**, чтобы подтянуть чек-листы и текстовые отчеты операторов.

## Обновление версии снапшота

### Шаг 1. Обновление процедуры логов в БД `GROSVER_GROUP` (на сервере SAP)


```sql
USE [GROSVER_GROUP]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_GetPlanSnapshotLogs]
AS
BEGIN
    SET NOCOUNT ON;

    -- Динамически рассчитываем разницу в днях между датой создания и максимальной датой плана внутри версии
    SELECT 
        MAX(Upload_Date) AS [Дата_Создания], 
        Report_Month AS [Месяц], 
        Version_Num AS [Версия],
        DATEDIFF(day, CAST(MAX(Upload_Date) AS DATE), MAX([Date])) AS [Горизонт_Дней]
    FROM [dbo].[GC_PLAN_SNAPSHOT] 
    GROUP BY Report_Month, Version_Num 
    ORDER BY Report_Month DESC, Version_Num DESC;
END
GO
```

---

### 1. Обновленная функция `fetchVersionLogs`

```javascript
// Функция выгрузки логов напрямую из SQL Server с добавлением Горизонта вторым столбцом
function fetchVersionLogs() {
  var ui = SpreadsheetApp.getUi();
  var query = "EXEC [dbo].[SP_GetPlanSnapshotLogs]";
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    
    if (!json.success || !json.data) {
      throw new Error(json.error || json.message || res.getContentText());
    }
    
    var data = json.data;
    if (data.length === 0) {
      ui.alert("В базе данных пока нет ни одной сохраненной версии плана.");
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("📖 Логи Версий");
    if (!logSheet) logSheet = ss.insertSheet("📖 Логи Версий");
    
    logSheet.clear(); // Очищаем старое перед перезаписью
    
    // Новая структура заголовков: Горизонт идет вторым столбцом
    var rows = [["Дата и время выгрузки (в базе)", "Горизонт (дней вперед)", "Отчетный Месяц", "Доступная Версия (План)"]];
    
    for (var i = 0; i < data.length; i++) {
      var uploadDate = data[i]["Дата_Создания"] ? data[i]["Дата_Создания"].toString().replace('T', ' ').substring(0, 19) : "";
      var reportMonth = formatSqlDateRegex(data[i]["Месяц"]);
      var horizonDays = data[i]["Горизонт_Дней"];
      var horizonText = (horizonDays !== null && horizonDays !== undefined) ? horizonDays + " дней" : "Не указан";
      
      rows.push([
        uploadDate, 
        horizonText, // Записываем во 2-й столбец
        reportMonth, 
        data[i]["Версия"]
      ]);
    }
    
    logSheet.getRange(1, 1, rows.length, 4).setValues(rows);
    logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
    logSheet.autoResizeColumns(1, 4);
    
    ui.alert("📖 Логи версий успешно обновлены!");
    
  } catch (e) {
    ui.alert("Ошибка загрузки логов: " + e.toString());
  }
}
```

### 2. Обновленная функция `createNewSnapshot`

```javascript
// Функция создания снимка плана с записью горизонта во второй столбец лога
function createNewSnapshot() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Снимок Плана", "На сколько дней вперед сохранить план? (по умолчанию 30):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var days = parseInt(response.getResponseText().trim()) || 30;

  var query = "EXEC [dbo].[SP_AddPlanSnapshot] @DaysAhead = " + days;
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    if (json.success && json.data && json.data.length > 0) {
      
      var newVersion = json.data[0].NewVersion;
      var month = formatSqlDateRegex(json.data[0].Month);
      var message = json.data[0].Message;
      
      // =====================================
      // ПИШЕМ ЛОГ В ТАБЛИЦУ (ГОРИЗОНТ ВО 2-Й СТОЛБЕЦ)
      // =====================================
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("📖 Логи Версий");
      if (!logSheet) {
        logSheet = ss.insertSheet("📖 Логи Версий");
        logSheet.appendRow(["Дата и время выгрузки", "Горизонт (дней вперед)", "Отчетный Месяц", "Доступная Версия (План)"]);
        logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
        logSheet.setFrozenRows(1);
      }
      
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm:ss");
      
      // ИСПРАВЛЕНО: Записываем параметр days во 2-й столбец
      logSheet.appendRow([timestamp, days + " дней", month, newVersion]);
      logSheet.autoResizeColumns(1, 4);
      // =====================================

      ui.alert("Успех!", message + "\nМесяц: " + month + "\nЗапись добавлена в логи.", ui.ButtonSet.OK);
    }
  } catch (e) { ui.alert("Критическая ошибка: " + e.toString()); }
}
```

## Оптимизация на уровне SQL (Фильтрация на сервере)

### Шаг 1. Добавление параметров дат в процедуру `SP_GetBotComments` (База `ChecklistBot`)

Выполните этот `ALTER PROCEDURE` в СУБД бота. Теперь процедура принимает `@DateFrom` и `@DateTo` и делает быструю фильтрацию по индексу даты:

```sql
USE [ChecklistBot]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_GetBotComments]
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Если даты не переданы, по умолчанию берем за последний год для безопасности
    IF @DateFrom IS NULL SET @DateFrom = GETDATE();
    IF @DateTo IS NULL SET @DateTo = GETDATE();

    WITH AllLogs AS (
        SELECT 
            r.MachineCode, 
            CAST(r.PartNumber AS NVARCHAR(50)) AS PartNumber,
            CAST(r.DocNumber AS NVARCHAR(50)) AS DocNumber, 
            CAST(r.DocPosition AS NVARCHAR(50)) AS DocPosition, 
            CAST(r.OperationNumber AS NVARCHAR(50)) AS OperationNumber,
            RTRIM(LTRIM(r.AuthorFullName)) AS AuthorFullName,
            RTRIM(LTRIM(r.OperationType)) AS OperationType,
            CONCAT(N'🛠 [', FORMAT(r.CreatedAt, 'dd.MM HH:mm'), N'] Чек-лист: ', q.Text, N' - ', CASE WHEN a.IsOk = 1 THEN N'ОК' ELSE N'НЕ ОК' END, ISNULL(N' (' + a.Note + N')', N'')) AS LogText, 
            r.CreatedAt
        FROM [dbo].[ToolReports] r 
        JOIN [dbo].[ToolReportAnswers] a ON r.Id = a.ReportId 
        JOIN [dbo].[ToolQuestions] q ON a.QuestionId = q.Id
        WHERE CAST(r.CreatedAt AS DATE) BETWEEN @DateFrom AND @DateTo -- ИНДЕКСНЫЙ ФИЛЬТР
        
        UNION ALL
        
        SELECT 
            c.MachineCode, 
            CAST(c.PartNumber AS NVARCHAR(50)) AS PartNumber,
            CAST(c.DocNumber AS NVARCHAR(50)), 
            CAST(c.DocPosition AS NVARCHAR(50)), 
            CAST(c.OperationNumber AS NVARCHAR(50)),
            RTRIM(LTRIM(c.AuthorFullName)) AS AuthorFullName,
            RTRIM(LTRIM(c.OperationType)) AS OperationType,
            CONCAT(N'💬 [', FORMAT(c.CreatedAt, 'dd.MM HH:mm'), N'] Коммент: ', c.Message), 
            c.CreatedAt
        FROM [dbo].[Checklists] c
        WHERE CAST(c.CreatedAt AS DATE) BETWEEN @DateFrom AND @DateTo -- ИНДЕКСНЫЙ ФИЛЬТР
    )
    SELECT 
        RTRIM(LTRIM(MachineCode)) AS MachineCode, 
        RTRIM(LTRIM(PartNumber)) AS PartNumber,
        RTRIM(LTRIM(DocNumber)) AS DocNumber, 
        RTRIM(LTRIM(DocPosition)) AS DocPosition, 
        RTRIM(LTRIM(OperationNumber)) AS OperationNumber,
        RTRIM(LTRIM(AuthorFullName)) AS AuthorFullName,
        RTRIM(LTRIM(OperationType)) AS OperationType,
        STRING_AGG(LogText, CHAR(10)) WITHIN GROUP (ORDER BY CreatedAt) AS FullComment
    FROM AllLogs 
    GROUP BY MachineCode, PartNumber, DocNumber, DocPosition, OperationNumber, AuthorFullName, OperationType;
END
GO
```

---

### Шаг 2. Обновление Google Apps Script (`Code.gs`)

```javascript
function fetchAndApplyComments() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var sheetName = sheet.getName();

  if (sheetName !== "📈 Детальный Дашборд" && sheetName !== "📊 Общий Дашборд") {
    ui.alert("Откройте '📈 Детальный Дашборд' или '📊 Общий Дашборд', чтобы загрузить комментарии.");
    return;
  }

  var rawSheet = ss.getSheetByName("Аналитика_Данные");
  if (!rawSheet) {
    ui.alert("Отсутствует лист с сырыми данными 'Аналитика_Данные'.");
    return;
  }

  try {
    var rawValues = rawSheet.getDataRange().getValues();
    if (rawValues.length <= 1) {
      ui.alert("Сначала загрузите аналитические данные за период.");
      return;
    }

    // =========================================================================
    // ОПТИМИЗАЦИЯ: Автоматически вычисляем границы дат для отправки в SQL бота
    // =========================================================================
    var dates = [];
    for (var row = 1; row < rawValues.length; row++) {
      var dStr = formatDateToYmd(rawValues[row][1]); // Читаем даты из столбца B
      if (dStr) dates.push(dStr);
    }
    
    if (dates.length === 0) {
      ui.alert("Не удалось определить диапазон дат для фильтрации комментариев.");
      return;
    }
    
    dates.sort(); // Сортируем даты по возрастанию
    var dateFrom = dates[0];
    var dateTo = dates[dates.length - 1];
    
    // Вызываем процедуру с передачей дат. Сервер вернет только нужные строки!
    var query = "EXEC [dbo].[SP_GetBotComments] @DateFrom = '" + dateFrom + "', @DateTo = '" + dateTo + "'";
    // =========================================================================

    var options = Object.assign({}, API_OPTIONS);
    options.payload = JSON.stringify({ "query": query });

    var response = UrlFetchApp.fetch(BOT_API_URL, options);
    var json = JSON.parse(response.getContentText());
    
    if (!json.success || !json.data) throw new Error(json.error || json.message || response.getContentText());
    var botComments = json.data;

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var lastCol = sheet.getLastColumn();

    var commentColIndex = -1;
    for (var c = 0; c < lastCol; c++) {
      if (values[2] && values[2][c] === "Комментарии из Бота") {
        commentColIndex = c; 
        break;
      }
    }
    if (commentColIndex === -1) {
      commentColIndex = lastCol;
      sheet.getRange(3, commentColIndex + 1).setValue("Комментарии из Бота")
           .setFontWeight("bold").setBackground("#fff2cc").setHorizontalAlignment("center");
      sheet.setColumnWidth(commentColIndex + 1, 380);
    }

    if (sheet.getLastRow() > 3) {
      sheet.getRange(4, commentColIndex + 1, sheet.getLastRow() - 3, 1).clearContent();
    }

    var commentsToWrite = [];
    var currentDate = "";
    var currentShift = "";
    var currentMachine = "";
    var currentArticle = "";

    for (var i = 3; i < values.length; i++) {
      var rowComments = [];
      var isTotalRow = values[i].join("").indexOf("Всего") > -1 || values[i].join("").indexOf("Итого") > -1;

      if (!isTotalRow) {
        
        // --- ДЕТАЛЬНЫЙ ДАШБОРД ---
        if (sheetName === "📈 Детальный Дашборд") {
          var dateCell    = values[i][0]; 
          var shiftCell   = values[i][1]; 
          var machineCell = values[i][2]; 
          var articleCell = values[i][3]; 

          if (dateCell !== "")    currentDate = formatDateValue(dateCell);
          if (shiftCell !== "")   currentShift = String(shiftCell).trim();
          if (machineCell !== "") currentMachine = String(machineCell).trim();
          var article = String(articleCell).trim();

          if (article !== "" && article.indexOf("Общий простой") === -1) {
            var contexts = getContextForDetailed(rawValues, currentDate, currentShift, currentMachine, article);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === currentMachine &&
                       bot.DocNumber === ctx.docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) &&
                       bot.OperationType === ctx.opType;
              });

              matched.forEach(function(m) {
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, "  |  ");
                rowComments.push("👤 Оператор: " + ctx.operator + " (" + ctx.opType + ") (Док. " + ctx.docNo + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "): " + singleLineComment);
              });
            });
          }
        } 
        
        // --- ОБЩИЙ ДАШБОРД ---
        else if (sheetName === "📊 Общий Дашборд") {
          var articleCell = values[i][0]; 
          var docCell     = values[i][1]; 

          if (articleCell !== "") currentArticle = String(articleCell).trim();
          var docNo = String(docCell).trim();

          if (docNo !== "" && docNo.indexOf("Всего") === -1 && docNo.indexOf("Общий простой") === -1) {
            var contexts = getContextForAggregated(rawValues, currentArticle, docNo);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === ctx.machine &&
                       bot.DocNumber === docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) &&
                       bot.OperationType === ctx.opType;
              });

              matched.forEach(function(m) {
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, "  |  ");
                rowComments.push("👤 " + ctx.operator + " (" + ctx.opType + ") (Станок " + ctx.machine + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "): " + singleLineComment);
              });
            });
          }
        }
      }

      commentsToWrite.push([rowComments.join("   ◆   ")]);
    }

    if (commentsToWrite.length > 0) {
      var targetRange = sheet.getRange(4, commentColIndex + 1, commentsToWrite.length, 1);
      targetRange.setValues(commentsToWrite);
      targetRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      targetRange.setVerticalAlignment("center");
      
      var numRows = sheet.getLastRow() - 3;
      if (numRows > 0) {
        sheet.setRowHeights(4, numRows, 20); 
      }
    }

    ui.alert("✅ Готово!", "Комментарии успешно сопоставлены по станкам, документам, позициям, операциям, ФИО и типу работы.", ui.ButtonSet.OK);

  } catch (e) {
    ui.alert("❌ Ошибка выполнения: " + e.toString());
  }
}

// Вспомогательная функция для конвертации дат в yyyy-MM-dd
function formatDateToYmd(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  var s = val.toString().trim();
  var matchDmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (matchDmy) {
    return matchDmy[3] + "-" + matchDmy[2] + "-" + matchDmy[1];
  }
  var matchYmd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchYmd) return s.substring(0, 10);
  return null;
}
```

### Как изменится скорость работы:

* **Раньше:** При загрузке дашборда за 2 дня по сети летели логи бота за 3 года (десятки тысяч строк), что сильно тормозило процесс.
* **Теперь:** Если на дашборде выбран период в 2 дня, SQL-сервер выберет только те комменты, которые написали в эти 2 дня, и передаст в Google Sheets легкий пакет данных (несколько десятков строк). Весь процесс займет доли секунды, а система будет масштабируема без ограничений.

**Весь обновленный код**

```js
var API_URL = "https://meridian-sap-api.shares.zrok.io/api/raw-query/exec";
var BOT_API_URL = "https://meridian-sap-api.shares.zrok.io/api/bot-query/exec";

var API_OPTIONS = {
  "method": "post",
  "contentType": "application/json",
  "muteHttpExceptions": true,
  "headers": { "skip_zrok_interstitial": "true" }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 Производство')
    .addItem('📥 1. Загрузить Аналитику (План/Факт)', 'showAnalyticsDialog')
    .addItem('📈 2. Детальный Дашборд (По дням)', 'buildDashboard')
    .addItem('📊 3. Общий Дашборд (Итоги + График)', 'buildAggregatedDashboard')
    .addSeparator()
    .addItem('💬 4. Подтянуть комментарии к дашборду', 'fetchAndApplyComments')
    .addSeparator()
    .addItem('📸 Создать новую версию плана (Snapshot)', 'createNewSnapshot')
    .addItem('📖 Загрузить историю версий (Логи из БД)', 'fetchVersionLogs')
    .addToUi();
}

function showAnalyticsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog')
      .setWidth(350).setHeight(400).setTitle('Загрузка Аналитики');
  SpreadsheetApp.getUi().showModalDialog(html, 'Параметры выгрузки');
}

function fetchAnalyticsData(params) {
  var query = "EXEC [dbo].[SP_GetProductionAnalytics] @DateFrom = '" + params.dateFrom + "', @DateTo = '" + params.dateTo + "', @PlanVersion = " + (params.version || "NULL");
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  var response = UrlFetchApp.fetch(API_URL, options);
  var json = JSON.parse(response.getContentText());
  
  if (!json.success || !json.data) {
    throw new Error("Ответ от SQL Server:\n" + (json.error || json.message || response.getContentText()));
  }
  
  var data = json.data;
  if(data.length === 0) return "Нет данных за этот период.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Аналитика_Данные");
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Аналитика_Данные");
  sheet.clear();

  var headers = ["Тип Данных", "Дата", "Смена", "Станок", "Номер документа", "Позиция", "Операция", "Артикул", "Оператор", "Тип Работы", "Версия Плана", "План Шт", "План Мин", "Факт Шт", "Факт Мин", "Прерывания Мин"];
  var rows = [headers];
  
  for (var i = 0; i < data.length; i++) {
    rows.push([
      data[i]["Тип Данных"], formatSqlDateRegex(data[i]["Дата"]), data[i]["Смена"], data[i]["Станок"],
      data[i]["Номер документа"] || "", data[i]["Позиция"] || "", data[i]["Операция"] || "", data[i]["Артикул"] || "",
      data[i]["Оператор"] || "", data[i]["Тип Работы"] || "", data[i]["Версия_Плана"],
      parseNumber(data[i]["План_Шт"]), parseNumber(data[i]["План_Время_Мин"]),
      parseNumber(data[i]["Факт_Шт"]), parseNumber(data[i]["Факт_Время_Мин"]),
      parseNumber(data[i]["Прерывания_Мин"])
    ]);
  }

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:P1").setFontWeight("bold").setBackground("#d9ead3");
  sheet.getRange(2, 2, rows.length-1, 1).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(2, 12, rows.length-1, 5).setNumberFormat("0");

  return "Успешно загружено строк: " + (rows.length - 1);
}

function createNewSnapshot() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Снимок Плана", "На сколько дней вперед сохранить план? (по умолчанию 30):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var days = parseInt(response.getResponseText().trim()) || 30;

  var query = "EXEC [dbo].[SP_AddPlanSnapshot] @DaysAhead = " + days;
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    if (json.success && json.data && json.data.length > 0) {
      
      var newVersion = json.data[0].NewVersion;
      var month = formatSqlDateRegex(json.data[0].Month);
      var message = json.data[0].Message;
      
      // =====================================
      // ПИШЕМ ЛОГ В ТАБЛИЦУ (ГОРИЗОНТ ВО 2-Й СТОЛБЕЦ)
      // =====================================
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("📖 Логи Версий");
      if (!logSheet) {
        logSheet = ss.insertSheet("📖 Логи Версий");
        logSheet.appendRow(["Дата и время выгрузки", "Горизонт (дней вперед)", "Отчетный Месяц", "Доступная Версия (План)"]);
        logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
        logSheet.setFrozenRows(1);
      }
      
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm:ss");
      
      // ИСПРАВЛЕНО: Записываем параметр days во 2-й столбец
      logSheet.appendRow([timestamp, days + " дней", month, newVersion]);
      logSheet.autoResizeColumns(1, 4);
      // =====================================

      ui.alert("Успех!", message + "\nМесяц: " + month + "\nЗапись добавлена в логи.", ui.ButtonSet.OK);
    }
  } catch (e) { ui.alert("Критическая ошибка: " + e.toString()); }
}

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📈 Детальный Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(2).showTotals(true);  
  pivotTable.addRowGroup(3).showTotals(true);  
  pivotTable.addRowGroup(4).showTotals(true);  
  pivotTable.addRowGroup(8).showTotals(false); 

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)');
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)');
  pivotTable.addPivotValue(16, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)');

  dashSheet.getRange("A1").setValue("Производственный Дашборд: Детальный (План / Факт / Простой)")
           .setFontSize(14).setFontWeight("bold").setFontColor("#1a73e8");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте станок (+), чтобы увидеть детализацию по артикулам")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 100); dashSheet.setColumnWidth(2, 70);
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 150);
  dashSheet.getRange("E:J").setNumberFormat('[=0]"";#,##0'); 
  dashSheet.getRange("G:G").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);
}

function buildAggregatedDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📊 Общий Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(2); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(8).showTotals(true);  
  pivotTable.addRowGroup(5).showTotals(false); 

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (шт)'); 
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (шт)'); 
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) { Logger.log(e); }

  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего План (мин)'); 
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Факт (мин)'); 
  pivotTable.addPivotValue(16, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Всего Простой (мин)'); 

  dashSheet.getRange("A1").setValue("Агрегированный Дашборд: Итоги за выбранный период")
           .setFontSize(14).setFontWeight("bold").setFontColor("#b31412");
  dashSheet.getRange("A2").setValue("💡 Разворачивайте Деталь (+), чтобы увидеть номера Документов")
           .setFontStyle("italic").setFontColor("#5f6368");

  dashSheet.setColumnWidth(1, 200); dashSheet.setColumnWidth(2, 130);  
  dashSheet.setColumnWidth(3, 110); dashSheet.setColumnWidth(4, 110); 
  dashSheet.setColumnWidth(5, 100); dashSheet.setColumnWidth(6, 110); 
  dashSheet.setColumnWidth(7, 110); dashSheet.setColumnWidth(8, 130); 

  dashSheet.getRange("C:H").setNumberFormat('[=0]"";#,##0'); 
  dashSheet.getRange("E:E").setNumberFormat('[=0]"";0%'); 
  dashSheet.setFrozenRows(3);

  SpreadsheetApp.flush();
  var lastRow = dashSheet.getLastRow();
  
  if (lastRow > 4) {
    var chart = dashSheet.newChart()
      .asColumnChart()
      .addRange(dashSheet.getRange(3, 1, lastRow - 3, 1))
      .addRange(dashSheet.getRange(3, 3, lastRow - 3, 2))
      .setNumHeaders(1)
      .setOption('title', 'Сравнение: План vs Факт по деталям')
      .setOption('hAxis.title', 'Артикул')
      .setOption('vAxis.title', 'Кол-во (шт)')
      .setOption('legend', {position: 'top'})
      .setOption('colors', ['#4285F4', '#34A853'])
      .setPosition(3, 10, 0, 0)
      .setOption('width', 800)
      .setOption('height', 450)
      .build();
      
    dashSheet.insertChart(chart);
  }
}

function fetchVersionLogs() {
  var ui = SpreadsheetApp.getUi();
  var query = "EXEC [dbo].[SP_GetPlanSnapshotLogs]";
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    
    if (!json.success || !json.data) {
      throw new Error(json.error || json.message || res.getContentText());
    }
    
    var data = json.data;
    if (data.length === 0) {
      ui.alert("В базе данных пока нет ни одной сохраненной версии плана.");
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("📖 Логи Версий");
    if (!logSheet) logSheet = ss.insertSheet("📖 Логи Версий");
    
    logSheet.clear(); // Очищаем старое перед перезаписью
    
    // Новая структура заголовков: Горизонт идет вторым столбцом
    var rows = [["Дата и время выгрузки (в базе)", "Горизонт (дней вперед)", "Отчетный Месяц", "Доступная Версия (План)"]];
    
    for (var i = 0; i < data.length; i++) {
      var uploadDate = data[i]["Дата_Создания"] ? data[i]["Дата_Создания"].toString().replace('T', ' ').substring(0, 19) : "";
      var reportMonth = formatSqlDateRegex(data[i]["Месяц"]);
      var horizonDays = data[i]["Горизонт_Дней"];
      var horizonText = (horizonDays !== null && horizonDays !== undefined) ? horizonDays + " дней" : "Не указан";
      
      rows.push([
        uploadDate, 
        horizonText, // Записываем во 2-й столбец
        reportMonth, 
        data[i]["Версия"]
      ]);
    }
    
    logSheet.getRange(1, 1, rows.length, 4).setValues(rows);
    logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
    logSheet.autoResizeColumns(1, 4);
    
    ui.alert("📖 Логи версий успешно обновлены!");
    
  } catch (e) {
    ui.alert("Ошибка загрузки логов: " + e.toString());
  }
}

function fetchAndApplyComments() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var sheetName = sheet.getName();

  if (sheetName !== "📈 Детальный Дашборд" && sheetName !== "📊 Общий Дашборд") {
    ui.alert("Откройте '📈 Детальный Дашборд' или '📊 Общий Дашборд', чтобы загрузить комментарии.");
    return;
  }

  var rawSheet = ss.getSheetByName("Аналитика_Данные");
  if (!rawSheet) {
    ui.alert("Отсутствует лист с сырыми данными 'Аналитика_Данные'.");
    return;
  }

  try {
    var rawValues = rawSheet.getDataRange().getValues();
    if (rawValues.length <= 1) {
      ui.alert("Сначала загрузите аналитические данные за период.");
      return;
    }

    // =========================================================================
    // ОПТИМИЗАЦИЯ: Автоматически вычисляем границы дат для отправки в SQL бота
    // =========================================================================
    var dates = [];
    for (var row = 1; row < rawValues.length; row++) {
      var dStr = formatDateToYmd(rawValues[row][1]); // Читаем даты из столбца B
      if (dStr) dates.push(dStr);
    }
    
    if (dates.length === 0) {
      ui.alert("Не удалось определить диапазон дат для фильтрации комментариев.");
      return;
    }
    
    dates.sort(); // Сортируем даты по возрастанию
    var dateFrom = dates[0];
    var dateTo = dates[dates.length - 1];
    
    // Вызываем процедуру с передачей дат. Сервер вернет только нужные строки!
    var query = "EXEC [dbo].[SP_GetBotComments] @DateFrom = '" + dateFrom + "', @DateTo = '" + dateTo + "'";
    // =========================================================================

    var options = Object.assign({}, API_OPTIONS);
    options.payload = JSON.stringify({ "query": query });

    var response = UrlFetchApp.fetch(BOT_API_URL, options);
    var json = JSON.parse(response.getContentText());
    
    if (!json.success || !json.data) throw new Error(json.error || json.message || response.getContentText());
    var botComments = json.data;

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var lastCol = sheet.getLastColumn();

    var commentColIndex = -1;
    for (var c = 0; c < lastCol; c++) {
      if (values[2] && values[2][c] === "Комментарии из Бота") {
        commentColIndex = c; 
        break;
      }
    }
    if (commentColIndex === -1) {
      commentColIndex = lastCol;
      sheet.getRange(3, commentColIndex + 1).setValue("Комментарии из Бота")
           .setFontWeight("bold").setBackground("#fff2cc").setHorizontalAlignment("center");
      sheet.setColumnWidth(commentColIndex + 1, 380);
    }

    if (sheet.getLastRow() > 3) {
      sheet.getRange(4, commentColIndex + 1, sheet.getLastRow() - 3, 1).clearContent();
    }

    var commentsToWrite = [];
    var currentDate = "";
    var currentShift = "";
    var currentMachine = "";
    var currentArticle = "";

    for (var i = 3; i < values.length; i++) {
      var rowComments = [];
      var isTotalRow = values[i].join("").indexOf("Всего") > -1 || values[i].join("").indexOf("Итого") > -1;

      if (!isTotalRow) {
        
        // --- ДЕТАЛЬНЫЙ ДАШБОРД ---
        if (sheetName === "📈 Детальный Дашборд") {
          var dateCell    = values[i][0]; 
          var shiftCell   = values[i][1]; 
          var machineCell = values[i][2]; 
          var articleCell = values[i][3]; 

          if (dateCell !== "")    currentDate = formatDateValue(dateCell);
          if (shiftCell !== "")   currentShift = String(shiftCell).trim();
          if (machineCell !== "") currentMachine = String(machineCell).trim();
          var article = String(articleCell).trim();

          if (article !== "" && article.indexOf("Общий простой") === -1) {
            var contexts = getContextForDetailed(rawValues, currentDate, currentShift, currentMachine, article);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === currentMachine &&
                       bot.DocNumber === ctx.docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) &&
                       bot.OperationType === ctx.opType;
              });

              matched.forEach(function(m) {
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, "  |  ");
                rowComments.push("👤 Оператор: " + ctx.operator + " (" + ctx.opType + ") (Док. " + ctx.docNo + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "): " + singleLineComment);
              });
            });
          }
        } 
        
        // --- ОБЩИЙ ДАШБОРД ---
        else if (sheetName === "📊 Общий Дашборд") {
          var articleCell = values[i][0]; 
          var docCell     = values[i][1]; 

          if (articleCell !== "") currentArticle = String(articleCell).trim();
          var docNo = String(docCell).trim();

          if (docNo !== "" && docNo.indexOf("Всего") === -1 && docNo.indexOf("Общий простой") === -1) {
            var contexts = getContextForAggregated(rawValues, currentArticle, docNo);
            
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === ctx.machine &&
                       bot.DocNumber === docNo &&
                       bot.DocPosition === ctx.posNo &&
                       bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) &&
                       bot.OperationType === ctx.opType;
              });

              matched.forEach(function(m) {
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, "  |  ");
                rowComments.push("👤 " + ctx.operator + " (" + ctx.opType + ") (Станок " + ctx.machine + ", Поз. " + ctx.posNo + ", Оп. " + ctx.opNo + "): " + singleLineComment);
              });
            });
          }
        }
      }

      commentsToWrite.push([rowComments.join("   ◆   ")]);
    }

    if (commentsToWrite.length > 0) {
      var targetRange = sheet.getRange(4, commentColIndex + 1, commentsToWrite.length, 1);
      targetRange.setValues(commentsToWrite);
      targetRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      targetRange.setVerticalAlignment("center");
      
      var numRows = sheet.getLastRow() - 3;
      if (numRows > 0) {
        sheet.setRowHeights(4, numRows, 20); 
      }
    }

    ui.alert("✅ Готово!", "Комментарии успешно сопоставлены по станкам, документам, позициям, операциям, ФИО и типу работы.", ui.ButtonSet.OK);

  } catch (e) {
    ui.alert("❌ Ошибка выполнения: " + e.toString());
  }
}

// Вспомогательная функция для конвертации дат в yyyy-MM-dd
function formatDateToYmd(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  var s = val.toString().trim();
  var matchDmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (matchDmy) {
    return matchDmy[3] + "-" + matchDmy[2] + "-" + matchDmy[1];
  }
  var matchYmd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchYmd) return s.substring(0, 10);
  return null;
}

function getContextForDetailed(rawValues, targetDateStr, targetShift, targetMachine, targetArticle) {
  var results = [];
  var seenKeys = {};

  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var rawDate = formatDateValue(rawRow[1]);
    var rawShift = String(rawRow[2]).trim();
    var rawMachine = String(rawRow[3]).trim(); 
    var rawArticle = String(rawRow[7]).trim(); 
    
    if (rawDate === targetDateStr && rawShift === targetShift && rawMachine === targetMachine && rawArticle === targetArticle) {
      var docNo = String(rawRow[4]).trim();
      var posNo = String(rawRow[5]).trim();
      var opNo = String(rawRow[6]).trim();
      var operator = String(rawRow[8]).trim();
      var opType = String(rawRow[9]).trim(); 
      
      var key = docNo + "_" + posNo + "_" + opNo + "_" + operator + "_" + opType;
      if (!seenKeys[key] && docNo !== "" && docNo !== "Вне документа") {
        seenKeys[key] = true;
        results.push({ docNo: docNo, posNo: posNo, opNo: opNo, operator: operator, opType: opType });
      }
    }
  }
  return results;
}

function getContextForAggregated(rawValues, targetArticle, targetDocNo) {
  var results = [];
  var seenKeys = {};

  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var rawArticle = String(rawRow[7]).trim();
    var rawDocNo = String(rawRow[4]).trim();
    
    if (rawArticle === targetArticle && rawDocNo === targetDocNo) {
      var machine = String(rawRow[3]).trim();
      var posNo = String(rawRow[5]).trim();
      var opNo = String(rawRow[6]).trim();
      var operator = String(rawRow[8]).trim();
      var opType = String(rawRow[9]).trim(); 
      
      var key = machine + "_" + posNo + "_" + opNo + "_" + operator + "_" + opType;
      if (!seenKeys[key] && machine !== "") {
        seenKeys[key] = true;
        results.push({ machine: machine, posNo: posNo, opNo: opNo, operator: operator, opType: opType });
      }
    }
  }
  return results;
}

function isNameMatch(nameSAP, nameBot) {
  if (!nameSAP || !nameBot) return false;
  
  var s = String(nameSAP).toLowerCase().trim();
  var b = String(nameBot).toLowerCase().trim();
  
  if (s === b) return true;
  
  var cleanS = s.replace(/[.,]/g, " ");
  var cleanB = b.replace(/[.,]/g, " ");
  
  var wordsS = cleanS.split(/\s+/).filter(Boolean);
  var wordsB = cleanB.split(/\s+/).filter(Boolean);
  
  if (wordsS.length === 0 || wordsB.length === 0) return false;
  
  var lastNameS = wordsS[0];
  var lastNameB = wordsB[0];
  
  if (lastNameS.length > 2 && lastNameS === lastNameB) return true;
  
  for (var i = 0; i < wordsS.length; i++) {
    for (var j = 0; j < wordsB.length; j++) {
      if (wordsS[i].length > 3 && wordsS[i] === wordsB[j]) {
        return true;
      }
    }
  }
  
  return false;
}

function formatDateValue(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "dd.MM.yyyy");
  }
  var s = val.toString().trim();
  var matchYmd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchYmd) {
    return matchYmd[3] + "." + matchYmd[2] + "." + matchYmd[1];
  }
  var matchDmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (matchDmy) {
    return s.substring(0, 10);
  }
  return s;
}

function formatSqlDateRegex(sqlDateStr) {
  if (!sqlDateStr) return '';
  var match = sqlDateStr.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + "." + match[2] + "." + match[1] : sqlDateStr;
}

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}
```

## Разбор ошибок БД

- Дублирование простоев (Прерываний).
- Дублирование Плана (Снапшоты).
- Отрицательное время.

**Исправления**

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.VW_PRODUCTION_ANALYTICS', 'V') IS NOT NULL
    DROP VIEW dbo.VW_PRODUCTION_ANALYTICS;
GO

CREATE VIEW [dbo].[VW_PRODUCTION_ANALYTICS] AS

-- =========================================================================
-- 1. СРЕЗ: ПЛАН (Применяем DISTINCT для защиты от дублей Ганта)
-- =========================================================================
SELECT DISTINCT
    N'План' AS [Тип Данных],
    CONVERT(DATE, RIGHT(RTRIM(p.[Shift]), 10), 104) AS [Дата],
    CAST(LEFT(RTRIM(p.[Shift]), 1) AS INT) AS [Смена],
    RTRIM(LTRIM(p.RESOURCE)) AS [Станок],
    RTRIM(LTRIM(CAST(p.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа],
    RTRIM(LTRIM(CAST(p.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(p.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(p.ItemCode)) AS [Артикул],
    NULL AS [Оператор],
    CASE WHEN p.Setup_Done LIKE N'%наладка%' THEN N'Наладка' ELSE N'Обработка' END AS [Тип Работы], 
    p.[Version_Num] AS [Версия_Плана],
    CAST(ROUND(ISNULL(p.Plan_Qty_Details, 0), 0) AS INT) AS [План_Шт],
    CAST(ROUND(ISNULL(p.Duration, 0), 0) AS INT) AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_PLAN_SNAPSHOT] p
WHERE ISNULL(p.Duration, 0) > 0 -- Отсекаем нулевые и отрицательные планы

UNION ALL

-- =========================================================================
-- 2. СРЕЗ: ФАКТ (Защита от отрицательного времени)
-- =========================================================================
SELECT 
    CASE WHEN f.Kol_detalej < 0 THEN N'Факт (Брак/Сторно)' ELSE N'Факт' END AS [Тип Данных],
    f.Date AS [Дата],
    CAST(f.[Shift] AS INT) AS [Смена],
    RTRIM(LTRIM(f.APLATZ_ID)) AS [Станок],
    RTRIM(LTRIM(CAST(f.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа],
    RTRIM(LTRIM(CAST(f.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(f.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(f.ItemCode)) AS [Артикул],
    RTRIM(LTRIM(f.DisplayName)) AS [Оператор],
    CASE WHEN f.TYP = 'R' THEN N'Наладка' ELSE N'Обработка' END AS [Тип Работы], 
    0 AS [Версия_Плана],
    0 AS [План_Шт],
    0 AS [План_Время_Мин],
    CAST(ROUND(CASE WHEN f.Kol_detalej > 0 THEN f.Kol_detalej ELSE 0 END, 0) AS INT) AS [Факт_Шт],
    -- Жестко фильтруем: если время отрицательное, ставим 0
    CAST(ROUND(CASE WHEN f.[End Time] > f.[Start Time] THEN DATEDIFF(MINUTE, f.[Start Time], f.[End Time]) ELSE 0 END, 0) AS INT) AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин]
FROM [dbo].[GC_FACT_FINANCIAL_REPORT] f
WHERE f.[Start Time] IS NOT NULL AND f.[End Time] IS NOT NULL

UNION ALL

-- =========================================================================
-- 3. СРЕЗ: ПРЕРЫВАНИЯ (OUTER APPLY против дублирования + отсечка минусов)
-- =========================================================================
SELECT 
    N'Прерывание' AS [Тип Данных],
    i.Дата AS [Дата],
    CAST(i.Смена AS INT) AS [Смена],
    RTRIM(LTRIM(i.APLATZ_ID)) AS [Станок],
    ISNULL(RTRIM(LTRIM(CAST(i.BELNR_ID AS NVARCHAR(50)))), N'Вне документа') AS [Номер документа],
    ISNULL(RTRIM(LTRIM(CAST(i.BELPOS_ID AS NVARCHAR(50)))), N'-') AS [Позиция],
    ISNULL(RTRIM(LTRIM(CAST(i.POS_ID AS NVARCHAR(50)))), N'-') AS [Операция],
    ISNULL(RTRIM(LTRIM(i.ItemCode)), N'Общий простой станка') AS [Артикул],
    RTRIM(LTRIM(i.PERS_ID_Name)) AS [Оператор],
    N'Прерывание' AS [Тип Работы],
    0 AS [Версия_Плана],
    0 AS [План_Шт],
    0 AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    -- Жестко фильтруем: если время простоя отрицательное, ставим 0
    CAST(ROUND(CASE WHEN i.[Продолжительность, мин] > 0 THEN i.[Продолжительность, мин] ELSE 0 END, 0) AS INT) AS [Прерывания_Мин]
FROM (
    SELECT 
        t10.APLATZ_ID,
        t0.PERS_ID_Name,
        t1.BELNR_ID, 
        t1.BELPOS_ID, 
        t1.POS_ID,
        t2.ItemCode,
        DATEDIFF(mi, t10.DATUM_VON, (CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END)) AS [Продолжительность, мин],
        CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END AS Смена,
        CASE 
            WHEN (CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END) = 1 THEN CAST(t10.DATUM_VON AS DATE)
            WHEN CAST(t10.DATUM_VON AS TIME) BETWEEN '19:00:00.0000000' AND '23:59:59.0000000' THEN CAST(t10.DATUM_VON AS DATE)
            ELSE CAST(DATEADD(day, -1, t10.DATUM_VON) AS DATE)
        END AS Дата
    FROM GC_APLATZ_STILLSTAND_BY_SHIFT t10
    LEFT JOIN BEAS_APLATZ_STILLSTAND t0 ON t10.INTNR = t0.INTNR AND t10.APLATZ_ID = t0.APLATZ_ID
    
    -- ИСПОЛЬЗУЕМ OUTER APPLY: берем строго 1 документ, чтобы не умножать простой на число операторов
    OUTER APPLY (
        SELECT TOP 1 b.BELNR_ID, b.BELPOS_ID, b.POS_ID 
        FROM beas_arbzeit b 
        WHERE b.APLATZ_ID = t0.APLATZ_ID 
          AND t0.DATUM_VON >= b.ANFZEIT 
          AND t0.DATUM_VON < b.ENDZEIT
        ORDER BY b.ANFZEIT DESC
    ) t1
    LEFT JOIN BEAS_FTPOS t2 ON t2.BELNR_ID = t1.BELNR_ID AND t2.BELPOS_ID = t1.BELPOS_ID 
    WHERE t10.DATUM_VON >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1) 
      AND t10.DATUM_VON < t10.DATUM_BIS
      AND t10.APLATZ_ID IN (SELECT APLATZ_ID FROM BEAS_APLATZ WHERE Active = 'J' AND GRUPPE IN ('Lathes', 'Milling') AND (APLATZ_ID NOT IN ('L02', 'L05', 'L08', 'L11', 'M04', 'M08', 'Mill', 'Turning')))
) i
WHERE i.Дата >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1);
GO
```

## Обновляем процедуру логов

```sql
USE [GROSVER_GROUP]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_GetPlanSnapshotLogs]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MAX(Upload_Date) AS [Дата_Создания], 
        Report_Month AS [Месяц], 
        Version_Num AS [Версия],
        MIN([Date]) AS [Начало_Плана],   -- Берем самую раннюю дату в версии
        MAX([Date]) AS [Конец_Плана]     -- Берем самую позднюю дату в версии
    FROM [dbo].[GC_PLAN_SNAPSHOT] 
    GROUP BY Report_Month, Version_Num 
    ORDER BY Report_Month DESC, Version_Num DESC;
END
GO
```

```js
function fetchVersionLogs() {
  var ui = SpreadsheetApp.getUi();
  var query = "EXEC [dbo].[SP_GetPlanSnapshotLogs]";
  
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  try {
    var res = UrlFetchApp.fetch(API_URL, options);
    var json = JSON.parse(res.getContentText());
    
    if (!json.success || !json.data) {
      throw new Error(json.error || json.message || res.getContentText());
    }
    
    var data = json.data;
    if (data.length === 0) {
      ui.alert("В базе данных пока нет ни одной сохраненной версии плана.");
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("📖 Логи Версий");
    if (!logSheet) logSheet = ss.insertSheet("📖 Логи Версий");
    
    logSheet.clear(); // Очищаем старое перед перезаписью
    
    // Новая структура заголовков: Реальный период плана
    var rows = [["Дата и время выгрузки (в базе)", "Период плана (С - По)", "Отчетный Месяц", "Доступная Версия (План)"]];
    
    for (var i = 0; i < data.length; i++) {
      var uploadDate = data[i]["Дата_Создания"] ? data[i]["Дата_Создания"].toString().replace('T', ' ').substring(0, 19) : "";
      var reportMonth = formatSqlDateRegex(data[i]["Месяц"]);
      
      // Формируем красивую строку периода (например: 21.08.2026 - 26.08.2026)
      var dateStart = formatSqlDateRegex(data[i]["Начало_Плана"]);
      var dateEnd = formatSqlDateRegex(data[i]["Конец_Плана"]);
      var planPeriod = (dateStart && dateEnd) ? (dateStart + " - " + dateEnd) : "Не определен";
      
      rows.push([
        uploadDate, 
        planPeriod, // Записываем период во 2-й столбец
        reportMonth, 
        data[i]["Версия"]
      ]);
    }
    
    logSheet.getRange(1, 1, rows.length, 4).setValues(rows);
    logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fff2cc");
    logSheet.autoResizeColumns(1, 4);
    
    ui.alert("📖 Логи версий успешно обновлены!");
    
  } catch (e) {
    ui.alert("Ошибка загрузки логов: " + e.toString());
  }
}
```

## Обновление добавили поля и аналитику ИИ

```sql
USE [GROSVER_GROUP]
GO

IF OBJECT_ID('dbo.VW_PRODUCTION_ANALYTICS', 'V') IS NOT NULL
    DROP VIEW dbo.VW_PRODUCTION_ANALYTICS;
GO

CREATE VIEW [dbo].[VW_PRODUCTION_ANALYTICS] AS

-- =========================================================================
-- 1. СРЕЗ: ПЛАН
-- =========================================================================
SELECT DISTINCT
    N'План' AS [Тип Данных],
    CONVERT(DATE, RIGHT(RTRIM(p.[Shift]), 10), 104) AS [Дата],
    CAST(LEFT(RTRIM(p.[Shift]), 1) AS INT) AS [Смена],
    RTRIM(LTRIM(p.RESOURCE)) AS [Станок],
    RTRIM(LTRIM(CAST(p.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа],
    RTRIM(LTRIM(CAST(p.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(p.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(p.ItemCode)) AS [Артикул],
    NULL AS [Оператор],
    CASE WHEN p.Setup_Done LIKE N'%наладка%' THEN N'Наладка' ELSE N'Обработка' END AS [Тип Работы], 
    p.[Version_Num] AS [Версия_Плана],
    CAST(ROUND(ISNULL(p.Plan_Qty_Details, 0), 0) AS INT) AS [План_Шт],
    CAST(ROUND(ISNULL(p.Duration, 0), 0) AS INT) AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин],
    CAST(ISNULL(p.TEAPLATZ, 0) AS FLOAT) AS [Тшт_План],
    CAST(0 AS FLOAT) AS [Тшт_Факт],
    NULL AS [Тип_Прерывания],
    NULL AS [Комментарий_Прерывания]
FROM [dbo].[GC_PLAN_SNAPSHOT] p
WHERE ISNULL(p.Duration, 0) > 0 

UNION ALL

-- =========================================================================
-- 2. СРЕЗ: ФАКТ (С защитой от отрицательного времени и расчетом нормы)
-- =========================================================================
SELECT 
    CASE WHEN f.Kol_detalej < 0 THEN N'Факт (Брак/Сторно)' ELSE N'Факт' END AS [Тип Данных],
    f.Date AS [Дата],
    CAST(f.[Shift] AS INT) AS [Смена],
    RTRIM(LTRIM(f.APLATZ_ID)) AS [Станок],
    RTRIM(LTRIM(CAST(f.BELNR_ID AS NVARCHAR(50)))) AS [Номер документа],
    RTRIM(LTRIM(CAST(f.BELPOS_ID AS NVARCHAR(50)))) AS [Позиция],
    RTRIM(LTRIM(CAST(f.POS_ID AS NVARCHAR(50)))) AS [Операция],
    RTRIM(LTRIM(f.ItemCode)) AS [Артикул],
    RTRIM(LTRIM(f.DisplayName)) AS [Оператор],
    CASE WHEN f.TYP = 'R' THEN N'Наладка' ELSE N'Обработка' END AS [Тип Работы], 
    0 AS [Версия_Плана],
    0 AS [План_Шт],
    0 AS [План_Время_Мин],
    CAST(ROUND(CASE WHEN f.Kol_detalej > 0 THEN f.Kol_detalej ELSE 0 END, 0) AS INT) AS [Факт_Шт],
    CAST(ROUND(CASE WHEN f.[End Time] > f.[Start Time] THEN DATEDIFF(MINUTE, f.[Start Time], f.[End Time]) ELSE 0 END, 0) AS INT) AS [Факт_Время_Мин],
    0 AS [Прерывания_Мин],
    CAST(0 AS FLOAT) AS [Тшт_План],
    CAST(CASE WHEN f.TYP = 'A' THEN ISNULL(f.Norma, 0) ELSE 0 END AS FLOAT) AS [Тшт_Факт],
    NULL AS [Тип_Прерывания],
    NULL AS [Комментарий_Прерывания]
FROM [dbo].[GC_FACT_FINANCIAL_REPORT] f
WHERE f.[Start Time] IS NOT NULL AND f.[End Time] IS NOT NULL

UNION ALL

-- =========================================================================
-- 3. СРЕЗ: ПРЕРЫВАНИЯ (С подключением справочника простоев и отсечением дублей)
-- =========================================================================
SELECT 
    N'Прерывание' AS [Тип Данных],
    i.Дата AS [Дата],
    CAST(i.Смена AS INT) AS [Смена],
    RTRIM(LTRIM(i.APLATZ_ID)) AS [Станок],
    ISNULL(RTRIM(LTRIM(CAST(i.BELNR_ID AS NVARCHAR(50)))), N'Вне документа') AS [Номер документа],
    ISNULL(RTRIM(LTRIM(CAST(i.BELPOS_ID AS NVARCHAR(50)))), N'-') AS [Позиция],
    ISNULL(RTRIM(LTRIM(CAST(i.POS_ID AS NVARCHAR(50)))), N'-') AS [Операция],
    ISNULL(RTRIM(LTRIM(i.ItemCode)), N'Общий простой станка') AS [Артикул],
    RTRIM(LTRIM(i.PERS_ID_Name)) AS [Оператор],
    N'Прерывание' AS [Тип Работы],
    0 AS [Версия_Плана],
    0 AS [План_Шт],
    0 AS [План_Время_Мин],
    0 AS [Факт_Шт],
    0 AS [Факт_Время_Мин],
    CAST(ROUND(CASE WHEN i.[Продолжительность, мин] > 0 THEN i.[Продолжительность, мин] ELSE 0 END, 0) AS INT) AS [Прерывания_Мин],
    CAST(0 AS FLOAT) AS [Тшт_План],
    CAST(0 AS FLOAT) AS [Тшт_Факт],
    RTRIM(LTRIM(i.GRUNDINFO_STANDARD)) AS [Тип_Прерывания],
    RTRIM(LTRIM(i.GRUNDINFO_COMMENT)) AS [Комментарий_Прерывания]
FROM (
    SELECT 
        t10.APLATZ_ID, t0.PERS_ID_Name, t1.BELNR_ID, t1.BELPOS_ID, t1.POS_ID, t2.ItemCode,
        t6.GRUNDINFO AS GRUNDINFO_STANDARD,
        t0.GRUNDINFO AS GRUNDINFO_COMMENT,
        DATEDIFF(mi, t10.DATUM_VON, (CASE WHEN t10.DATUM_BIS <= GETDATE() THEN t10.DATUM_BIS ELSE GETDATE() END)) AS [Продолжительность, мин],
        CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END AS Смена,
        CASE 
            WHEN (CASE WHEN CAST(t10.DATUM_VON AS TIME) >= '07:00:00' AND CAST(t10.DATUM_VON AS TIME) < '19:00:00' THEN 1 ELSE 2 END) = 1 THEN CAST(t10.DATUM_VON AS DATE)
            WHEN CAST(t10.DATUM_VON AS TIME) BETWEEN '19:00:00.0000000' AND '23:59:59.0000000' THEN CAST(t10.DATUM_VON AS DATE)
            ELSE CAST(DATEADD(day, -1, t10.DATUM_VON) AS DATE)
        END AS Дата
    FROM GC_APLATZ_STILLSTAND_BY_SHIFT t10
    LEFT JOIN BEAS_APLATZ_STILLSTAND t0 ON t10.INTNR = t0.INTNR AND t10.APLATZ_ID = t0.APLATZ_ID
    LEFT JOIN BEAS_STILLSTANDGRUND t6 ON t0.GRUNDID = t6.GRUNDID
    OUTER APPLY (
        SELECT TOP 1 b.BELNR_ID, b.BELPOS_ID, b.POS_ID FROM beas_arbzeit b 
        WHERE b.APLATZ_ID = t0.APLATZ_ID AND t0.DATUM_VON >= b.ANFZEIT AND t0.DATUM_VON < b.ENDZEIT
        ORDER BY b.ANFZEIT DESC
    ) t1
    LEFT JOIN BEAS_FTPOS t2 ON t2.BELNR_ID = t1.BELNR_ID AND t2.BELPOS_ID = t1.BELPOS_ID 
    WHERE t10.DATUM_VON >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1) 
      AND t10.DATUM_VON < t10.DATUM_BIS
      AND t10.APLATZ_ID IN (SELECT APLATZ_ID FROM BEAS_APLATZ WHERE Active = 'J' AND GRUPPE IN ('Lathes', 'Milling') AND (APLATZ_ID NOT IN ('L02', 'L05', 'L08', 'L11', 'M04', 'M08', 'Mill', 'Turning')))
) i
WHERE i.Дата >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1);
GO
```

```sql
USE [GROSVER_GROUP]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetProductionAnalytics]
    @DateFrom DATE,
    @DateTo DATE,
    @PlanVersion INT = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    IF @PlanVersion IS NULL OR @PlanVersion = 0
    BEGIN
        DECLARE @Month DATE = DATEADD(month, DATEDIFF(month, 0, @DateFrom), 0);
        SET @PlanVersion = ISNULL((SELECT MAX([Version_Num]) FROM [dbo].[GC_PLAN_SNAPSHOT] WHERE [Report_Month] = @Month), 1);
    END

    SELECT 
        [Тип Данных], [Дата], [Смена], [Станок], [Номер документа], [Позиция], [Операция], [Артикул], [Оператор],
        [Тип Работы], [Версия_Плана], [План_Шт], [План_Время_Мин], [Факт_Шт], [Факт_Время_Мин], [Прерывания_Мин],
        [Тшт_План], [Тшт_Факт], [Тип_Прерывания], [Комментарий_Прерывания]
    FROM [dbo].[VW_PRODUCTION_ANALYTICS]
    WHERE [Дата] >= @DateFrom AND [Дата] <= @DateTo
      AND ([Версия_Плана] = @PlanVersion OR [Версия_Плана] = 0)
    ORDER BY [Дата], [Смена], [Станок];
END
GO
```

```sql
USE [GROSVER_GROUP]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetPlanSnapshotLogs]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MAX(Upload_Date) AS [Дата_Создания], 
        Report_Month AS [Месяц], 
        Version_Num AS [Версия],
        MIN([Date]) AS [Начало_Плана],
        MAX([Date]) AS [Конец_Плана]
    FROM [dbo].[GC_PLAN_SNAPSHOT] 
    GROUP BY Report_Month, Version_Num 
    ORDER BY Report_Month DESC, Version_Num DESC;
END
GO
```

**Сама логика в google sheets**

```js
var API_URL = "https://meridian-sap-api.shares.zrok.io/api/raw-query/exec";
var BOT_API_URL = "https://meridian-sap-api.shares.zrok.io/api/bot-query/exec";

var API_OPTIONS = {
  "method": "post",
  "contentType": "application/json",
  "muteHttpExceptions": true,
  "headers": { "skip_zrok_interstitial": "true" }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 Производство')
    .addItem('📥 1. Загрузить Аналитику (План/Факт)', 'showAnalyticsDialog')
    .addItem('📈 2. Детальный Дашборд (По дням)', 'buildDashboard')
    .addItem('📊 3. Общий Дашборд (Итоги + График)', 'buildAggregatedDashboard')
    .addSeparator()
    .addItem('💬 4. Подтянуть комментарии к дашборду', 'fetchAndApplyComments')
    .addItem('🤖 5. Сгенерировать промпт для ИИ', 'generateAiPrompt')
    .addSeparator()
    .addItem('📸 Создать новую версию плана (Snapshot)', 'createNewSnapshot')
    .addItem('📖 Загрузить историю версий (Логи)', 'fetchVersionLogs')
    .addToUi();
}

function showAnalyticsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog').setWidth(350).setHeight(400).setTitle('Загрузка Аналитики');
  SpreadsheetApp.getUi().showModalDialog(html, 'Параметры выгрузки');
}

function fetchAnalyticsData(params) {
  var query = "EXEC [dbo].[SP_GetProductionAnalytics] @DateFrom = '" + params.dateFrom + "', @DateTo = '" + params.dateTo + "', @PlanVersion = " + (params.version || "NULL");
  var options = Object.assign({}, API_OPTIONS);
  options.payload = JSON.stringify({ "query": query });

  var response = UrlFetchApp.fetch(API_URL, options);
  var json = JSON.parse(response.getContentText());
  
  if (!json.success || !json.data) throw new Error("Ответ от SQL Server:\n" + (json.error || json.message || response.getContentText()));
  
  var data = json.data;
  if(data.length === 0) return "Нет данных за этот период.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Аналитика_Данные");
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Аналитика_Данные");
  sheet.clear();

  var headers = ["Тип Данных", "Дата", "Смена", "Станок", "Номер документа", "Позиция", "Операция", "Артикул", "Оператор", "Тип Работы", "Версия Плана", "План Шт", "План Мин", "Факт Шт", "Факт Мин", "Прерывания Мин", "Тшт План", "Тшт Факт", "Тип Прерывания", "Комментарий Прерывания"];
  var rows = [headers];
  
  for (var i = 0; i < data.length; i++) {
    var tPlan = data[i]["Тшт_План"] > 0 ? parseNumber(data[i]["Тшт_План"]) : "";
    var tFact = data[i]["Тшт_Факт"] > 0 ? parseNumber(data[i]["Тшт_Факт"]) : "";
    var safeDate = "'" + formatSqlDateRegex(data[i]["Дата"]);

    rows.push([
      data[i]["Тип Данных"], safeDate, data[i]["Смена"], data[i]["Станок"],
      data[i]["Номер документа"] || "", data[i]["Позиция"] || "", data[i]["Операция"] || "", data[i]["Артикул"] || "",
      data[i]["Оператор"] || "", data[i]["Тип Работы"] || "", data[i]["Версия_Плана"],
      parseNumber(data[i]["План_Шт"]), parseNumber(data[i]["План_Время_Мин"]),
      parseNumber(data[i]["Факт_Шт"]), parseNumber(data[i]["Факт_Время_Мин"]),
      parseNumber(data[i]["Прерывания_Мин"]),
      tPlan, tFact,
      data[i]["Тип_Прерывания"] || "", data[i]["Комментарий_Прерывания"] || ""
    ]);
  }

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:T1").setFontWeight("bold").setBackground("#d9ead3");
  sheet.getRange(2, 2, rows.length-1, 1).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(2, 12, rows.length-1, 5).setNumberFormat("0");
  sheet.getRange(2, 17, rows.length-1, 2).setNumberFormat("0.00");

  return "Успешно загружено строк: " + (rows.length - 1);
}

// ---------------------------------------------------------
// ДАШБОРДЫ (ПОЛНАЯ ИЕРАРХИЯ ДО ОПЕРАЦИЙ)
// ---------------------------------------------------------
function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📈 Детальный Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(2).showTotals(true);  // Дата 
  pivotTable.addRowGroup(3).showTotals(true);  // Смена 
  pivotTable.addRowGroup(4).showTotals(true);  // Станок 
  pivotTable.addRowGroup(8).showTotals(false); // Артикул 
  pivotTable.addRowGroup(5).showTotals(false); // Документ 
  pivotTable.addRowGroup(6).showTotals(false); // Позиция 
  pivotTable.addRowGroup(7).showTotals(false); // Операция 

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)');
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)');
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) {}

  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)');
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)');
  pivotTable.addPivotValue(16, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)');

  pivotTable.addPivotValue(17, SpreadsheetApp.PivotTableSummarizeFunction.MAX).setDisplayName('Тшт План');
  pivotTable.addPivotValue(18, SpreadsheetApp.PivotTableSummarizeFunction.MAX).setDisplayName('Тшт Факт');

  dashSheet.getRange("A1").setValue("Производственный Дашборд: Детальный (Вплоть до Операций)")
           .setFontSize(14).setFontWeight("bold").setFontColor("#1a73e8");

  dashSheet.getRange("A:A").setNumberFormat("dd.MM.yyyy");

  dashSheet.getRange("H:M").setNumberFormat('[=0]"";#,##0'); 
  dashSheet.getRange("J:J").setNumberFormat('[=0]"";0%'); 
  dashSheet.getRange("N:O").setNumberFormat('[=0]"";0.00'); 
  dashSheet.setFrozenRows(3);
  dashSheet.autoResizeColumns(1, 15);
}

function buildAggregatedDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Аналитика_Данные");
  if (!sourceSheet) { SpreadsheetApp.getUi().alert("Сначала загрузите данные!"); return; }

  var dashName = "📊 Общий Дашборд";
  var dashSheet = ss.getSheetByName(dashName);
  if (dashSheet) ss.deleteSheet(dashSheet);
  
  dashSheet = ss.insertSheet(dashName);
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(2); 

  var sourceRange = sourceSheet.getDataRange();
  var pivotTable = dashSheet.getRange('A3').createPivotTable(sourceRange);

  pivotTable.addRowGroup(8).showTotals(true);  // Артикул
  pivotTable.addRowGroup(5).showTotals(false); // Документ
  pivotTable.addRowGroup(6).showTotals(false); // Позиция
  pivotTable.addRowGroup(7).showTotals(false); // Операция

  pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (шт)'); 
  pivotTable.addPivotValue(14, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (шт)'); 
  
  try {
    var pf = pivotTable.addCalculatedPivotValue('% Выполн.', "=IFERROR('Факт Шт' / 'План Шт'; 0)");
    pf.setFormulaSyntax(SpreadsheetApp.PivotTableCalculatedValueFormulaSyntax.CUSTOM);
  } catch(e) {}

  pivotTable.addPivotValue(13, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('План (мин)'); 
  pivotTable.addPivotValue(15, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Факт (мин)'); 
  pivotTable.addPivotValue(16, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Простой (мин)'); 

  pivotTable.addPivotValue(17, SpreadsheetApp.PivotTableSummarizeFunction.MAX).setDisplayName('Тшт План');
  pivotTable.addPivotValue(18, SpreadsheetApp.PivotTableSummarizeFunction.MAX).setDisplayName('Тшт Факт');

  dashSheet.getRange("A1").setValue("Агрегированный Дашборд: Итоги за выбранный период")
           .setFontSize(14).setFontWeight("bold").setFontColor("#b31412");

  dashSheet.getRange("E:J").setNumberFormat('[=0]"";#,##0'); 
  dashSheet.getRange("G:G").setNumberFormat('[=0]"";0%'); 
  dashSheet.getRange("K:L").setNumberFormat('[=0]"";0.00'); 
  dashSheet.setFrozenRows(3);
  dashSheet.autoResizeColumns(1, 12);

  SpreadsheetApp.flush();
  var lastRow = dashSheet.getLastRow();
  
  // Улучшенная отсортированная логика графика по чистым данным
  var rawValues = sourceSheet.getDataRange().getValues();
  var chartDataMap = {};
  for (var i = 1; i < rawValues.length; i++) {
    var article = String(rawValues[i][7]).trim(); 
    var pQty = parseFloat(rawValues[i][11]) || 0; 
    var fQty = parseFloat(rawValues[i][13]) || 0; 

    if (article !== "" && article !== "Общий простой станка") {
      var shortArticle = trimArticleForChart(article); 
      if (!chartDataMap[shortArticle]) {
        chartDataMap[shortArticle] = { plan: 0, fact: 0 };
      }
      chartDataMap[shortArticle].plan += pQty;
      chartDataMap[shortArticle].fact += fQty;
    }
  }

  var sortedChartItems = [];
  for (var art in chartDataMap) {
    if (chartDataMap[art].plan > 0 || chartDataMap[art].fact > 0) {
      sortedChartItems.push({
        art: art,
        plan: chartDataMap[art].plan,
        fact: chartDataMap[art].fact,
        total: chartDataMap[art].plan + chartDataMap[art].fact
      });
    }
  }
  sortedChartItems.sort(function(a, b) { return b.total - a.total; });

  var chartArray = [["Артикул", "План (шт)", "Факт (шт)"]];
  for (var k = 0; k < sortedChartItems.length; k++) {
    chartArray.push([sortedChartItems[k].art, sortedChartItems[k].plan, sortedChartItems[k].fact]);
  }

  if (chartArray.length > 1) {
    var chartStartCol = 26; // Столбец Z
    dashSheet.getRange(1, chartStartCol, chartArray.length, 3).setValues(chartArray);

    var chart = dashSheet.newChart()
      .asColumnChart()
      .addRange(dashSheet.getRange(1, chartStartCol, chartArray.length, 1)) 
      .addRange(dashSheet.getRange(1, chartStartCol + 1, chartArray.length, 2)) 
      .setNumHeaders(1)
      .setOption('title', 'Сравнение: План vs Факт по деталям')
      .setOption('vAxis.title', 'Кол-во (шт)')
      .setOption('legend', {position: 'top'})
      .setOption('colors', ['#4285F4', '#34A853'])
      .setOption('hAxis', {
        title: 'Артикул (сокращенно)',
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 1 
      })
      .setPosition(3, 14, 0, 0) 
      .setOption('width', 950) 
      .setOption('height', 450)
      .build();
    dashSheet.insertChart(chart);
    dashSheet.hideColumns(chartStartCol, 3);
  }
}

// ---------------------------------------------------------
// СОПОСТАВЛЕНИЕ (ЖЕСТКАЯ СТАТИЧЕСКАЯ АДРЕСАЦИЯ БЕЗ СДВИГОВ)
// ---------------------------------------------------------
function fetchAndApplyComments() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var sheetName = sheet.getName();

  if (sheetName !== "📈 Детальный Дашборд" && sheetName !== "📊 Общий Дашборд") {
    ui.alert("Откройте '📈 Детальный Дашборд' или '📊 Общий Дашборд'."); return;
  }

  var rawSheet = ss.getSheetByName("Аналитика_Данные");
  if (!rawSheet) { ui.alert("Отсутствует лист 'Аналитика_Данные'."); return; }

  try {
    var rawValues = rawSheet.getDataRange().getValues();
    if (rawValues.length <= 1) return;

    var dates = [];
    for (var row = 1; row < rawValues.length; row++) {
      var dStr = formatDateToYmd(rawValues[row][1]); 
      if (dStr) dates.push(dStr);
    }
    dates.sort(); 
    var query = "EXEC [dbo].[SP_GetBotComments] @DateFrom = '" + dates[0] + "', @DateTo = '" + dates[dates.length - 1] + "'";
    
    var options = Object.assign({}, API_OPTIONS);
    options.payload = JSON.stringify({ "query": query });

    var botComments = [];
    try {
      var response = UrlFetchApp.fetch(BOT_API_URL, options);
      var json = JSON.parse(response.getContentText());
      if (json.success && json.data) {
        botComments = json.data;
      } else {
        throw new Error();
      }
    } catch (e) {
      // Безопасный откат к старой процедуре без дат
      var fallbackQuery = "EXEC [dbo].[SP_GetBotComments]";
      options.payload = JSON.stringify({ "query": fallbackQuery });
      var response = UrlFetchApp.fetch(BOT_API_URL, options);
      var json = JSON.parse(response.getContentText());
      if (json.success && json.data) botComments = json.data;
    }

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();

    // ЖЕСТКАЯ СТАТИЧЕСКАЯ АДРЕСАЦИЯ: Никаких сдвигов из-за багов сводных таблиц!
    var commentColIndex = (sheetName === "📈 Детальный Дашборд") ? 15 : 12; // Столбец P или M

    sheet.getRange(3, commentColIndex + 1).setValue("Причины и Комментарии").setFontWeight("bold").setBackground("#fff2cc").setHorizontalAlignment("center");
    sheet.setColumnWidth(commentColIndex + 1, 450);

    if (sheet.getLastRow() > 3) sheet.getRange(4, commentColIndex + 1, sheet.getLastRow() - 3, 1).clearContent();

    var commentsToWrite = [];
    var curDate = "", curShift = "", curMachine = "", curArticle = "", curDoc = "", curPos = "", curOp = "";

    for (var i = 3; i < values.length; i++) {
      var uniqueStrings = {};
      var isTotalRow = values[i].join("").indexOf("Всего") > -1 || values[i].join("").indexOf("Итого") > -1;

      if (!isTotalRow) {
        
        // --- ДЕТАЛЬНЫЙ ДАШБОРД (СТАТИКА) ---
        if (sheetName === "📈 Детальный Дашборд") {
          if (values[i][0] !== "") curDate = formatDateValue(values[i][0]);
          if (values[i][1] !== "") curShift = String(values[i][1]).trim();
          if (values[i][2] !== "") curMachine = String(values[i][2]).trim();
          if (values[i][3] !== "") curArticle = String(values[i][3]).trim();
          if (values[i][4] !== "") curDoc = String(values[i][4]).trim();
          if (values[i][5] !== "") curPos = String(values[i][5]).trim();
          if (values[i][6] !== "") curOp = String(values[i][6]).trim();

          if (curArticle !== "" && curArticle.indexOf("Общий простой") === -1) {
            var contexts = getContextForDetailed(rawValues, curDate, curShift, curMachine, curArticle, curDoc, curPos, curOp);
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === curMachine && bot.DocNumber === ctx.docNo &&
                       bot.DocPosition === ctx.posNo && bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) && bot.OperationType === ctx.opType;
              });
              matched.forEach(function(m) {
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, " | ");
                var msg = "🤖 Бот: " + ctx.operator + " (" + ctx.opType + "): " + singleLineComment;
                uniqueStrings[msg] = true;
              });
            });
          }
          var sapInterrupts = getSapInterruptionsDetailed(rawValues, curDate, curShift, curMachine, curArticle, curDoc, curPos, curOp);
          sapInterrupts.forEach(function(int) {
            var msg = "⚠️ SAP: " + int.type;
            if (int.comment && int.comment !== int.type) msg += " (" + int.comment + ")";
            msg += " [" + int.duration + " мин, " + int.operator + "]";
            uniqueStrings[msg] = true;
          });
        } 
        
        // --- ОБЩИЙ ДАШБОРД (СТАТИКА) ---
        else if (sheetName === "📊 Общий Дашборд") {
          if (values[i][0] !== "") curArticle = String(values[i][0]).trim();
          if (values[i][1] !== "") curDoc = String(values[i][1]).trim();
          if (values[i][2] !== "") curPos = String(values[i][2]).trim();
          if (values[i][3] !== "") curOp = String(values[i][3]).trim();

          if (curArticle !== "" && curArticle.indexOf("Общий простой") === -1) {
            var contexts = getContextForAggregated(rawValues, curArticle, curDoc, curPos, curOp);
            contexts.forEach(function(ctx) {
              var matched = botComments.filter(function(bot) {
                return bot.MachineCode === ctx.machine && bot.DocNumber === curDoc &&
                       bot.DocPosition === ctx.posNo && bot.OperationNumber === ctx.opNo &&
                       isNameMatch(ctx.operator, bot.AuthorFullName) && bot.OperationType === ctx.opType;
              });
              matched.forEach(function(m) {
                var singleLineComment = String(m.FullComment).replace(/\r?\n/g, " | ");
                var msg = "🤖 Бот: " + ctx.operator + " (" + ctx.opType + " на " + ctx.machine + "): " + singleLineComment;
                uniqueStrings[msg] = true;
              });
            });
          }
          
          // SAP простои подтягиваются всегда
          if (curArticle !== "") {
            var sapInterrupts = getSapInterruptionsAggregated(rawValues, curArticle, curDoc, curPos, curOp);
            sapInterrupts.forEach(function(int) {
              var msg = "⚠️ SAP: " + int.type;
              if (int.comment && int.comment !== int.type) msg += " (" + int.comment + ")";
              msg += " [" + int.duration + " мин суммарно]";
              uniqueStrings[msg] = true;
            });
          }
        }
      }
      var rowCommentsArr = Object.keys(uniqueStrings);
      commentsToWrite.push([rowCommentsArr.join("  ◆  ")]);
    }

    if (commentsToWrite.length > 0) {
      var targetRange = sheet.getRange(4, commentColIndex + 1, commentsToWrite.length, 1);
      targetRange.setValues(commentsToWrite);
      targetRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      targetRange.setVerticalAlignment("center");
      var numRows = sheet.getLastRow() - 3;
      if (numRows > 0) sheet.setRowHeights(4, numRows, 20); 
    }
    ui.alert("✅ Готово!", "Системные причины (SAP) и отчеты бота сгруппированы.", ui.ButtonSet.OK);
  } catch (e) { ui.alert("❌ Ошибка выполнения: " + e.toString()); }
}

// ---------------------------------------------------------
// ГЕНЕРАЦИЯ ПРОМПТА ДЛЯ ИИ (СТАТИКА)
// ---------------------------------------------------------
function generateAiPrompt() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashSheet = ss.getSheetByName("📊 Общий Дашборд");
  
  if (!dashSheet) { ui.alert("Ошибка", "Сначала создайте '📊 Общий Дашборд'.", ui.ButtonSet.OK); return; }
  var data = dashSheet.getDataRange().getValues();
  if (data.length <= 3) return;

  // 1. Формируем шапку промпта (Инструкция для ИИ)
  var promptText = "Действуй как Главный инженер по производству (COO) и Старший дата-аналитик. " +
                   "Ниже представлена выгрузка производственных данных (План vs Факт, простои и комментарии наладчиков/операторов) из нашей ERP-системы за выбранный период.\n\n" +
                   "Твоя задача — провести глубокий профессиональный аудит этих данных и предоставить развернутый отчет. " +
                   "Обрати особое внимание на аномалии (перевыполнение плана на 200%+ или критическое недовыполнение), огромные простои и комментарии из чек-листов.\n\n" +
                   "Структура твоего ответа должна быть следующей:\n" +
                   "1. 📊 Краткое резюме (Executive Summary): Общая картина, % выполнения плана в целом, главные цифры.\n" +
                   "2. 🚨 Критические зоны (Узкие горлышки): Топ-3 проблемы (артикулы или документы), где план провален сильнее всего или зафиксированы максимальные простои.\n" +
                   "3. ⚙️ Анализ простоев и комментариев: Проанализируй столбец с простоями и сопоставь их с комментариями ботов. Какие системные проблемы в цеху?\n" +
                   "4. 📈 Аномалии: Обрати внимание на детали, где факт превышает план более чем на 150%. С чем это может быть связано (ошибка планирования, сторно)?\n" +
                   "5. 🛠 План действий (Actionable Insights): 3-5 конкретных шагов для руководства по улучшению ситуации.\n\n" +
                   "ДАННЫЕ ДЛЯ АНАЛИЗА (в формате Markdown):\n\n";

  // 2. Формируем таблицу Markdown
  promptText += "| Артикул | Док | Поз | Оп | План шт | Факт шт | % Вып. | План мин | Факт мин | Простой мин | Тшт План | Тшт Факт | Причины и Комментарии |\n";
  promptText += "|---|---|---|---|---|---|---|---|---|---|---|---|---|\n";

  var curArt = "", curDoc = "", curPos = "", curOp = "";

  for (var i = 3; i < data.length; i++) { 
    var row = data[i];
    
    // Статическая адресация сводного отчета
    if (row[0] !== "") curArt = String(row[0]).trim();
    if (row[1] !== "") curDoc = String(row[1]).trim();
    if (row[2] !== "") curPos = String(row[2]).trim();
    if (row[3] !== "") curOp = String(row[3]).trim();

    var pQty = formatNumber(row[4]); 
    var fQty = formatNumber(row[5]);
    var perc = formatPercent(row[6]);
    var pMin = formatNumber(row[7]); 
    var fMin = formatNumber(row[8]); 
    var iMin = formatNumber(row[9]);
    var tPlan = formatNumber(row[10]); 
    var tFact = formatNumber(row[11]); 
    var comms = String(row[12] || "").replace(/\r?\n/g, " <br> ").replace(/\|/g, " ");

    if (pQty === "-" && fQty === "-" && iMin === "-") continue;
    promptText += "| " + curArt + " | " + curDoc + " | " + curPos + " | " + curOp + " | " + pQty + " | " + fQty + " | " + perc + " | " + pMin + " | " + fMin + " | " + iMin + " | " + tPlan + " | " + tFact + " | " + comms + " |\n";
  }

  var promptSheet = ss.getSheetByName("🤖 ИИ Промпт");
  if (!promptSheet) promptSheet = ss.insertSheet("🤖 ИИ Промпт"); else promptSheet.clear();

  promptSheet.getRange("A1").setValue("Скопируйте текст из желтой ячейки ниже (Ctrl+C) и вставьте в ИИ:").setFontWeight("bold").setFontSize(12).setFontColor("#1a73e8");
  promptSheet.getRange("A2").setValue(promptText).setBackground("#fff2cc").setWrap(true).setVerticalAlignment("top").setFontFamily("Consolas");
  promptSheet.setColumnWidth(1, 1000); promptSheet.setRowHeight(2, 500);
  ss.setActiveSheet(promptSheet); ss.moveActiveSheet(3); 
}

// ---------------------------------------------------------
// УТИЛИТЫ И ПОИСК
// ---------------------------------------------------------
function getSapInterruptionsDetailed(rawValues, targetDateStr, targetShift, targetMachine, targetArticle, targetDoc, targetPos, targetOp) {
  var resultsMap = {};
  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    if (rawRow[0] !== "Прерывание") continue;
    if (formatDateValue(rawRow[1]) === targetDateStr && String(rawRow[2]).trim() === targetShift && String(rawRow[3]).trim() === targetMachine && String(rawRow[7]).trim() === targetArticle) {
      if (targetDoc && targetDoc !== "" && String(rawRow[4]).trim() !== targetDoc && String(rawRow[4]).trim() !== "Вне документа") continue;
      if (targetPos && targetPos !== "" && String(rawRow[5]).trim() !== targetPos && String(rawRow[5]).trim() !== "-") continue;
      if (targetOp && targetOp !== "" && String(rawRow[6]).trim() !== targetOp && String(rawRow[6]).trim() !== "-") continue;
      var duration = parseFloat(rawRow[15]) || 0;
      if (duration > 0) {
        var type = String(rawRow[18]).trim(), comment = String(rawRow[19]).trim(), operator = String(rawRow[8]).trim();
        var key = type + "|" + comment + "|" + operator;
        if (!resultsMap[key]) resultsMap[key] = { duration: 0, type: type, comment: comment, operator: operator };
        resultsMap[key].duration += duration;
      }
    }
  }
  var results = []; for (var k in resultsMap) results.push(resultsMap[k]); return results;
}

function getSapInterruptionsAggregated(rawValues, targetArticle, targetDoc, targetPos, targetOp) {
  var resultsMap = {};
  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    if (rawRow[0] !== "Прерывание") continue;
    if (String(rawRow[7]).trim() === targetArticle) {
      if (targetDoc && targetDoc !== "" && String(rawRow[4]).trim() !== targetDoc && String(rawRow[4]).trim() !== "Вне документа") continue;
      if (targetPos && targetPos !== "" && String(rawRow[5]).trim() !== targetPos && String(rawRow[5]).trim() !== "-") continue;
      if (targetOp && targetOp !== "" && String(rawRow[6]).trim() !== targetOp && String(rawRow[6]).trim() !== "-") continue;
      var duration = parseFloat(rawRow[15]) || 0;
      if (duration > 0) {
        var type = String(rawRow[18]).trim(), comment = String(rawRow[19]).trim();
        var key = type + "|" + comment;
        if (!resultsMap[key]) resultsMap[key] = { duration: 0, type: type, comment: comment };
        resultsMap[key].duration += duration;
      }
    }
  }
  var results = []; for (var k in resultsMap) results.push(resultsMap[k]); return results;
}

function getContextForDetailed(rawValues, targetDateStr, targetShift, targetMachine, targetArticle, targetDoc, targetPos, targetOp) {
  var results = []; var seenKeys = {};
  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    if (formatDateValue(rawRow[1]) === targetDateStr && String(rawRow[2]).trim() === targetShift && String(rawRow[3]).trim() === targetMachine && String(rawRow[7]).trim() === targetArticle) {
      var docNo = String(rawRow[4]).trim(), posNo = String(rawRow[5]).trim(), opNo = String(rawRow[6]).trim(), operator = String(rawRow[8]).trim(), opType = String(rawRow[9]).trim(); 
      if (targetDoc && targetDoc !== "" && docNo !== targetDoc) continue;
      if (targetPos && targetPos !== "" && posNo !== targetPos) continue;
      if (targetOp && targetOp !== "" && opNo !== targetOp) continue;
      var key = docNo + "_" + posNo + "_" + opNo + "_" + operator + "_" + opType;
      if (!seenKeys[key] && docNo !== "" && docNo !== "Вне документа") { seenKeys[key] = true; results.push({ docNo: docNo, posNo: posNo, opNo: opNo, operator: operator, opType: opType }); }
    }
  } return results;
}

function getContextForAggregated(rawValues, targetArticle, targetDoc, targetPos, targetOp) {
  var results = []; var seenKeys = {};
  for (var i = 1; i < rawValues.length; i++) {
    var rawRow = rawValues[i];
    var docNo = String(rawRow[4]).trim(), posNo = String(rawRow[5]).trim(), opNo = String(rawRow[6]).trim();
    if (String(rawRow[7]).trim() === targetArticle) {
      if (targetDoc && targetDoc !== "" && docNo !== targetDoc) continue;
      if (targetPos && targetPos !== "" && posNo !== targetPos) continue;
      if (targetOp && targetOp !== "" && opNo !== targetOp) continue;
      var machine = String(rawRow[3]).trim(), operator = String(rawRow[8]).trim(), opType = String(rawRow[9]).trim(); 
      var key = machine + "_" + docNo + "_" + posNo + "_" + opNo + "_" + operator + "_" + opType;
      if (!seenKeys[key] && machine !== "") { seenKeys[key] = true; results.push({ machine: machine, docNo: docNo, posNo: posNo, opNo: opNo, operator: operator, opType: opType }); }
    }
  } return results;
}

function isNameMatch(nameSAP, nameBot) {
  if (!nameSAP || !nameBot) return false;
  var s = String(nameSAP).toLowerCase().trim(), b = String(nameBot).toLowerCase().trim();
  if (s === b) return true;
  var wordsS = s.replace(/[.,]/g, " ").split(/\s+/).filter(Boolean), wordsB = b.replace(/[.,]/g, " ").split(/\s+/).filter(Boolean);
  if (wordsS.length === 0 || wordsB.length === 0) return false;
  if (wordsS[0].length > 2 && wordsS[0] === wordsB[0]) return true;
  for (var i = 0; i < wordsS.length; i++) for (var j = 0; j < wordsB.length; j++) if (wordsS[i].length > 3 && wordsS[i] === wordsB[j]) return true;
  return false;
}

function formatDateToYmd(val) {
  if (!val) return null;
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var cleanVal = val.toString().trim().replace(/^'/, "");
  var matchDmy = cleanVal.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (matchDmy) return matchDmy[3] + "-" + matchDmy[2] + "-" + matchDmy[1];
  var matchYmd = cleanVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return matchYmd ? cleanVal.substring(0, 10) : null;
}

function formatDateValue(val) {
  if (!val) return "";
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), "dd.MM.yyyy");
  var cleanVal = val.toString().trim().replace(/^'/, "");
  var matchYmd = cleanVal.match(/^(\d{4})-(\d{2})-(\d{2})/); 
  if (matchYmd) return matchYmd[3] + "." + matchYmd[2] + "." + matchYmd[1];
  var matchDmy = cleanVal.match(/^(\d{2})\.(\d{2})\.(\d{4})/); 
  return matchDmy ? cleanVal.substring(0, 10) : cleanVal;
}

function formatSqlDateRegex(sqlDateStr) {
  if (!sqlDateStr) return '';
  var match = sqlDateStr.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + "." + match[2] + "." + match[1] : sqlDateStr;
}

function formatNumber(val) {
  if (val === "" || val === null || val === undefined) return "-";
  var s = String(val);
  if (s.indexOf("#") > -1 || s.indexOf("DIV") > -1 || s.indexOf("N/A") > -1) return "-";
  var num = parseFloat(s.replace(/\s/g, '').replace(',', '.'));
  return isNaN(num) ? s : num.toString();
}

function formatPercent(val) {
  if (val === "" || val === null || val === undefined) return "-";
  var s = String(val);
  if (s.indexOf("#") > -1 || s.indexOf("DIV") > -1 || s.indexOf("N/A") > -1) return "0%"; 
  var num = parseFloat(s.replace(/\s/g, '').replace(',', '.'));
  return isNaN(num) ? s : Math.round(num * 100) + "%";
}

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}

function trimArticleForChart(article) {
  var s = String(article).trim();
  if (s.length === 11 && (s.startsWith("2101") || s.startsWith("4301") || s.startsWith("5100") || s.startsWith("5400") || s.startsWith("5000"))) {
    return "..." + s.substring(7); 
  }
  return s;
}
```

