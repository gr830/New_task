## Процедура получения Gant

```sql
USE [GROSVER_GROUP]
GO

/****** Object:  StoredProcedure [dbo].[GetGanttMachineSchedule]    Script Date: 06.10.2026 11:11:17 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[GetGanttMachineSchedule]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        h.BELNR_ID,                     
        LTRIM(RTRIM(h.AUFTRAG)) AS AUFTRAG,                      
        h.PRIOR_ID,                     
        p.BELPOS_ID,                    
        LTRIM(RTRIM(p.ItemCode)) AS ItemCode,  -- Номер/Артикул детали (4301000...)
        LTRIM(RTRIM(p.ItemName)) AS ItemName,  -- Наименование детали
        a.POS_ID,                       
        LTRIM(RTRIM(a.POS_TEXT)) AS POS_TEXT,                     
        LTRIM(RTRIM(a.APLATZ_ID)) AS APLATZ_ID,                    
        a.GESAMT_ANFZEIT,               
        a.GESAMT_ENDZEIT,               
        p.MENGE AS PLAN_MENGE,          
        ISNULL(arb.TOTAL_MENGE_GUT, 0) AS FACT_MENGE_GUT 
    FROM [GROSVER_GROUP].[dbo].[BEAS_FTHAUPT] h
    INNER JOIN [GROSVER_GROUP].[dbo].[BEAS_FTPOS] p 
        ON h.BELNR_ID = p.BELNR_ID
    INNER JOIN [GROSVER_GROUP].[dbo].[BEAS_FTAPL] a 
        ON p.BELNR_ID = a.BELNR_ID 
        AND p.BELPOS_ID = a.BELPOS_ID
    LEFT JOIN (
        SELECT 
            BELNR_ID, 
            BELPOS_ID, 
            POS_ID, 
            SUM(ISNULL(MENGE_GUT, 0)) AS TOTAL_MENGE_GUT
        FROM [GROSVER_GROUP].[dbo].[BEAS_ARBZEIT]
        WHERE ISNULL(CANCEL, 0) = 0 
        GROUP BY BELNR_ID, BELPOS_ID, POS_ID
    ) arb 
        ON a.BELNR_ID = arb.BELNR_ID 
        AND a.BELPOS_ID = arb.BELPOS_ID 
        AND a.POS_ID = arb.POS_ID
    WHERE 
        h.ABGKZ = 'N' 
        AND a.ABGKZ = 'N' 
        AND LTRIM(RTRIM(h.PRIOR_ID)) IN ('1-Hi') 
        AND ISNULL(arb.TOTAL_MENGE_GUT, 0) < p.MENGE
        AND a.GESAMT_ANFZEIT IS NOT NULL 
        AND a.GESAMT_ENDZEIT IS NOT NULL
        AND a.GESAMT_ANFZEIT <> a.GESAMT_ENDZEIT
        AND (LTRIM(a.APLATZ_ID) LIKE 'M%' OR LTRIM(a.APLATZ_ID) LIKE 'L%')
		AND LTRIM(RTRIM(a.APLATZ_ID)) NOT IN ('L08', 'L05', 'L02', 'M08', 'M10')
    ORDER BY 
        a.GESAMT_ANFZEIT, 
        h.BELNR_ID, 
        a.POS_ID;
END

GO
```