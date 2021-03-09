using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Reflection;

namespace PMCTool.App.Helpers
{
    internal static class AppLogger
    {
        private static string logFilePath = "";
        private static string logFileExtension = "log";

        public static void LogToFile(string message, string processName, bool bIncludeTimeStamp)
        {
            Uri location = new Uri(Assembly.GetEntryAssembly().GetName().CodeBase);
            logFilePath = new FileInfo(location.AbsolutePath).Directory.FullName;

            if (!Directory.Exists(logFilePath))
            {
                Directory.CreateDirectory(logFilePath);
            }

            string logFullFileName = logFilePath + @"\" + "PCMTool.App" + "." + logFileExtension;

            string strDataToWrite = "";
            try
            {
                if (!string.IsNullOrEmpty(processName))
                {
                    strDataToWrite = "Logged from Procedure: " + processName;
                }

                if (bIncludeTimeStamp)
                {
                    if (!string.IsNullOrWhiteSpace(strDataToWrite))
                    {
                        strDataToWrite = strDataToWrite + " @ " + GetTimeStamp();
                    }
                    else
                    {
                        strDataToWrite = strDataToWrite + GetTimeStamp();
                    }
                }

                if (!File.Exists(logFullFileName))
                {
                    using (StreamWriter sw = File.CreateText(logFullFileName))
                    {
                        sw.WriteLine("Created @ " + GetTimeStamp());
                    }
                }
                using (var strmWrite = new StreamWriter(logFullFileName, true, new System.Text.UTF8Encoding(false)))
                {
                    if (!string.IsNullOrWhiteSpace(strDataToWrite))
                    {
                        strmWrite.Write(strDataToWrite + "   ----   ");
                    }
                    strmWrite.Write(message + strmWrite.NewLine);
                }
            }
            catch (Exception)
            {
                return;
            }
        }

        private static string GetTimeStamp()
        {
            string strCurrentDateTime = DateTime.Now.ToShortDateString() + " " + DateTime.Now.ToLongTimeString();
            string strCurrentTimeZone = GetTimeZone();

            if (!strCurrentTimeZone.Equals(""))
            {
                strCurrentDateTime = strCurrentDateTime + " " + strCurrentTimeZone;
            }

            return strCurrentDateTime;
        }

        private static string GetTimeZone()
        {
            TimeZoneInfo localZone = TimeZoneInfo.Local;
            return GetInitials(localZone.Id);
        }

        private static string GetInitials(string text)
        {
            string returnVal = string.Empty;
            string[] initials = text.Split(' ');

            foreach (string initial in initials)
            {
                if (initial.Substring(0, 1).ToUpper() != "(")
                {
                    returnVal += initial.Substring(0, 1).ToUpper();
                }
                else
                {
                    returnVal += initial.ToUpper();
                }
            }

            return returnVal;
        }
    }
}
