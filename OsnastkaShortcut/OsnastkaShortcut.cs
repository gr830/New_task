using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

static class Program
{
    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new MainForm());
    }
}

public class MainForm : Form
{
    private TextBox txtNumber;
    private TextBox txtDest;
    private RichTextBox log;
    private Button btnAdd;
    private Button btnClear;
    private Button btnCreate;
    private Button btnExit;

    private string appDir;

    private const uint FILE_ATTRIBUTE_DIRECTORY = 0x10;

    [DllImport("shlwapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool PathRelativePathTo(
        StringBuilder pszPath,
        string pszFrom,
        uint dwAttrFrom,
        string pszTo,
        uint dwAttrTo);

    public MainForm()
    {
        appDir = AppDomain.CurrentDomain.BaseDirectory;

        if (appDir.EndsWith("\\") && appDir.Length > 3)
            appDir = appDir.Substring(0, appDir.Length - 1);

        Text = "Создание ярлыков для оснастки";
        Size = new Size(980, 720);
        MinimumSize = new Size(860, 620);
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Segoe UI", 9F);

        BuildUi();

        Log("Приложение запущено.", Color.Gray);
        Log("Папка приложения: " + appDir, Color.Gray);
    }

    private void BuildUi()
    {
        TableLayoutPanel table = new TableLayoutPanel();
        table.Dock = DockStyle.Fill;
        table.Padding = new Padding(10);
        table.ColumnCount = 1;
        table.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
        table.RowCount = 6;

        table.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        table.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        table.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        table.RowStyles.Add(new RowStyle(SizeType.Absolute, 90F));
        table.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        table.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));

        Controls.Add(table);

        Label lblNumber = new Label();
        lblNumber.Text = "Номер оснастки:";
        lblNumber.AutoSize = true;
        lblNumber.Margin = new Padding(3, 0, 3, 3);
        table.Controls.Add(lblNumber, 0, 0);

        txtNumber = new TextBox();
        txtNumber.Dock = DockStyle.Fill;
        txtNumber.Margin = new Padding(3, 0, 3, 10);
        table.Controls.Add(txtNumber, 0, 1);

        Label lblDest = new Label();
        lblDest.Text = "Папки назначения (по одной на строку или через ';'):";
        lblDest.AutoSize = true;
        lblDest.Margin = new Padding(3, 0, 3, 3);
        table.Controls.Add(lblDest, 0, 2);

        txtDest = new TextBox();
        txtDest.Multiline = true;
        txtDest.ScrollBars = ScrollBars.Vertical;
        txtDest.AcceptsReturn = true;
        txtDest.Dock = DockStyle.Fill;
        txtDest.Margin = new Padding(3, 0, 3, 10);
        table.Controls.Add(txtDest, 0, 3);

        FlowLayoutPanel buttonPanel = new FlowLayoutPanel();
        buttonPanel.FlowDirection = FlowDirection.LeftToRight;
        buttonPanel.AutoSize = true;
        buttonPanel.AutoSizeMode = AutoSizeMode.GrowAndShrink;
        buttonPanel.WrapContents = true;
        buttonPanel.Dock = DockStyle.Fill;
        buttonPanel.Margin = new Padding(0);
        table.Controls.Add(buttonPanel, 0, 4);

        btnAdd = new Button();
        btnAdd.Text = "Добавить папку...";
        btnAdd.AutoSize = true;
        btnAdd.Margin = new Padding(3, 3, 10, 3);
        btnAdd.Click += delegate { AddFolder(); };

        btnClear = new Button();
        btnClear.Text = "Очистить список";
        btnClear.AutoSize = true;
        btnClear.Margin = new Padding(3, 3, 10, 3);
        btnClear.Click += delegate { ClearFolders(); };

        btnCreate = new Button();
        btnCreate.Text = "Создать ярлыки";
        btnCreate.AutoSize = true;
        btnCreate.Margin = new Padding(3, 3, 10, 3);
        btnCreate.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
        btnCreate.Click += delegate { CreateShortcuts(); };

        btnExit = new Button();
        btnExit.Text = "Выход";
        btnExit.AutoSize = true;
        btnExit.Margin = new Padding(3, 3, 3, 3);
        btnExit.Click += delegate { Close(); };

        buttonPanel.Controls.Add(btnAdd);
        buttonPanel.Controls.Add(btnClear);
        buttonPanel.Controls.Add(btnCreate);
        buttonPanel.Controls.Add(btnExit);

        log = new RichTextBox();
        log.Dock = DockStyle.Fill;
        log.ReadOnly = true;
        log.BackColor = Color.White;
        log.Font = new Font("Consolas", 9F);
        log.Margin = new Padding(3, 10, 3, 3);
        table.Controls.Add(log, 0, 5);
    }

    private void Log(string message)
    {
        Log(message, Color.Black);
    }

    private void Log(string message, Color color)
    {
        if (log.InvokeRequired)
        {
            log.Invoke(new Action<string, Color>(Log), message, color);
            return;
        }

        log.SelectionStart = log.TextLength;
        log.SelectionLength = 0;
        log.SelectionColor = color;
        log.AppendText(DateTime.Now.ToString("HH:mm:ss") + " " + message + Environment.NewLine);
        log.SelectionColor = log.ForeColor;
        log.ScrollToCaret();
        Application.DoEvents();
    }

    private void ShowError(string message)
    {
        Log(message, Color.Red);
        MessageBox.Show(this, message, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
    }

    private void AddFolder()
    {
        using (FolderBrowserDialog dlg = new FolderBrowserDialog())
        {
            dlg.Description = "Выберите папку, куда нужно создать ярлык";
            dlg.ShowNewFolderButton = false;

            if (dlg.ShowDialog(this) == DialogResult.OK)
            {
                string current = txtDest.Text.Trim();

                if (current.Length > 0)
                    txtDest.Text = current + Environment.NewLine + dlg.SelectedPath;
                else
                    txtDest.Text = dlg.SelectedPath;

                Log("Добавлена папка: " + dlg.SelectedPath, Color.Gray);
            }
        }
    }

    private void ClearFolders()
    {
        txtDest.Clear();
        Log("Список папок назначения очищен.", Color.Gray);
    }

    private void CreateShortcuts()
    {
        btnCreate.Enabled = false;
        btnAdd.Enabled = false;
        btnClear.Enabled = false;
        Cursor = Cursors.WaitCursor;

        try
        {
            string number = txtNumber.Text.Trim().Trim('"');

            if (string.IsNullOrWhiteSpace(number))
            {
                ShowError("Укажите номер оснастки.");
                return;
            }

            if (number.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
            {
                ShowError("Номер оснастки содержит недопустимые для имени файла символы.");
                return;
            }

            string[] parts = txtDest.Text.Split(
                new char[] { ';', '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries);

            List<string> destFolders = new List<string>();
            HashSet<string> seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (string part in parts)
            {
                string p = part.Trim().Trim('"');

                if (p.Length == 0)
                    continue;

                try
                {
                    string resolved = ResolveDestFolder(p);

                    if (resolved != null && seen.Add(resolved))
                        destFolders.Add(resolved);
                }
                catch (Exception ex)
                {
                    ShowError("Не удалось разобрать путь: " + p + Environment.NewLine + ex.Message);
                    return;
                }
            }

            if (destFolders.Count == 0)
            {
                ShowError("Укажите хотя бы одну папку назначения.");
                return;
            }

            string targetAbs;

            try
            {
                // ВАЖНО: вот здесь считается путь к папке оснастки.
                // Сейчас логика такая же, как в вашем PowerShell-скрипте:
                // <папка EXE>\..\..\NX наладчики\_Программы на оснастку\<номер>
                //
                // Если нужно использовать другой путь — поменяйте эту строку.
                targetAbs = Path.GetFullPath(
                    Path.Combine(
                        Path.Combine(appDir, @"..\..\NX наладчики\_Программы на оснастку"),
                        number));
            }
            catch (Exception ex)
            {
                ShowError("Не удалось построить путь к целевой папке: " + ex.Message);
                return;
            }

            Log("Номер оснастки: " + number);
            Log("Целевая папка: " + targetAbs, Color.Blue);

            if (!Directory.Exists(targetAbs))
                Log("Целевая папка пока не существует — ярлыки всё равно будут созданы.", Color.Orange);

            List<string> missing = new List<string>();

            foreach (string d in destFolders)
            {
                if (!Directory.Exists(d))
                    missing.Add(d);
            }

            if (missing.Count > 0)
            {
                Log("Не найдены папки назначения:", Color.Red);

                foreach (string m in missing)
                    Log("  - " + m, Color.Red);

                string msg =
                    "Не найдены папки назначения:" +
                    Environment.NewLine +
                    Environment.NewLine +
                    string.Join(Environment.NewLine, missing.ToArray());

                MessageBox.Show(this, msg, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            Log("Папок для ярлыков: " + destFolders.Count);

            foreach (string d in destFolders)
                Log("  - " + d, Color.Gray);

            string windowsDir = Environment.ExpandEnvironmentVariables("%SystemRoot%");
            string explorer = Path.Combine(windowsDir, "explorer.exe");

            int created = 0;

            foreach (string dest in destFolders)
            {
                try
                {
                    string rel = GetRelativePath(dest, targetAbs);
                    string lnk = Path.Combine(dest, number + ".lnk");

                    CreateShortcut(
                        lnk,
                        explorer,
                        "\"" + rel + "\"",
                        dest,
                        "Папка оснастки " + number);

                    Log("[+] " + lnk, Color.Green);
                    Log("    -> explorer.exe \"" + rel + "\"", Color.Gray);

                    created++;
                }
                catch (Exception ex)
                {
                    Log("Ошибка при создании ярлыка в " + dest + ": " + ex.Message, Color.Red);
                }
            }

            if (created > 0)
            {
                Log("Готово. Создано ярлыков: " + created, Color.Green);
                MessageBox.Show(
                    this,
                    "Готово. Создано ярлыков: " + created,
                    "Создание ярлыков",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
            else
            {
                Log("Не удалось создать ни одного ярлыка.", Color.Red);
                MessageBox.Show(
                    this,
                    "Не удалось создать ни одного ярлыка. Смотрите журнал ниже.",
                    "Ошибка",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }
        }
        catch (Exception ex)
        {
            Log("Критическая ошибка: " + ex.Message, Color.Red);
            MessageBox.Show(
                this,
                "Критическая ошибка: " + ex.Message,
                "Ошибка",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
        finally
        {
            Cursor = Cursors.Default;
            btnCreate.Enabled = true;
            btnAdd.Enabled = true;
            btnClear.Enabled = true;
        }
    }

    private string ResolveDestFolder(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return null;

        path = path.Trim().Trim('"');
        path = Environment.ExpandEnvironmentVariables(path);

        if (!Path.IsPathRooted(path))
            path = Path.Combine(appDir, path);

        return Path.GetFullPath(path);
    }

    private static string GetRelativePath(string from, string to)
    {
        try
        {
            string fromDir = Path.GetFullPath(from).TrimEnd('\\') + "\\";
            string toPath = Path.GetFullPath(to);

            StringBuilder sb = new StringBuilder(4096);

            if (PathRelativePathTo(
                    sb,
                    fromDir,
                    FILE_ATTRIBUTE_DIRECTORY,
                    toPath,
                    FILE_ATTRIBUTE_DIRECTORY))
            {
                string rel = sb.ToString();

                if (!string.IsNullOrEmpty(rel))
                    return rel;
            }
        }
        catch
        {
            // Если не получилось через WinAPI, попробуем через Uri.
        }

        try
        {
            Uri fromUri = new Uri(from.TrimEnd('\\') + "\\");
            Uri toUri = new Uri(to);
            Uri relUri = fromUri.MakeRelativeUri(toUri);

            if (relUri != null && !relUri.IsAbsoluteUri)
            {
                return Uri.UnescapeDataString(relUri.ToString()).Replace('/', '\\');
            }
        }
        catch
        {
            // Если не получилось, вернём абсолютный путь.
        }

        return to;
    }

    private static void CreateShortcut(
        string shortcutPath,
        string targetPath,
        string arguments,
        string workingDirectory,
        string description)
    {
        Type shellType = Type.GetTypeFromProgID("WScript.Shell");

        if (shellType == null)
            throw new InvalidOperationException("Не удалось найти COM-объект WScript.Shell.");

        object shell = Activator.CreateInstance(shellType);
        object shortcut = null;

        try
        {
            shortcut = shellType.InvokeMember(
                "CreateShortcut",
                BindingFlags.InvokeMethod,
                null,
                shell,
                new object[] { shortcutPath });

            if (shortcut == null)
                throw new InvalidOperationException("Не удалось создать объект ярлыка.");

            Type shortcutType = shortcut.GetType();

            shortcutType.InvokeMember(
                "TargetPath",
                BindingFlags.SetProperty,
                null,
                shortcut,
                new object[] { targetPath });

            shortcutType.InvokeMember(
                "Arguments",
                BindingFlags.SetProperty,
                null,
                shortcut,
                new object[] { arguments });

            shortcutType.InvokeMember(
                "WorkingDirectory",
                BindingFlags.SetProperty,
                null,
                shortcut,
                new object[] { workingDirectory });

            shortcutType.InvokeMember(
                "Description",
                BindingFlags.SetProperty,
                null,
                shortcut,
                new object[] { description });

            shortcutType.InvokeMember(
                "IconLocation",
                BindingFlags.SetProperty,
                null,
                shortcut,
                new object[] { targetPath + ",0" });

            shortcutType.InvokeMember(
                "Save",
                BindingFlags.InvokeMethod,
                null,
                shortcut,
                null);
        }
        finally
        {
            if (shortcut != null && Marshal.IsComObject(shortcut))
                Marshal.ReleaseComObject(shortcut);

            if (shell != null && Marshal.IsComObject(shell))
                Marshal.ReleaseComObject(shell);
        }
    }
}