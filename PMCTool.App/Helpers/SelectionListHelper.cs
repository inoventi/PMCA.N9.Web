using PMCTool.Models.Core;
using System;
using System.Collections.Generic;

namespace PMCTool.App.Helpers
{
    public static class SelectionListHelper
    {
        public static List<SelectionListItem> AddNullOption(List<SelectionListItem> list, string nullValue)
        {
            SelectionListItem nullItem = new SelectionListItem
            {
                Key = null,
                Value = nullValue
            };

            list.Insert(0, nullItem);

            return list;
        }

        public static List<SelectionListItem> AddBlankSpaceOption(List<SelectionListItem> list, string nullValue)
        {
            SelectionListItem nullItem = new SelectionListItem
            {
                Key = Guid.Empty,
                Value = nullValue
            };

            list.Insert(0, nullItem);

            return list;
        }

        public static List<SelectionListItem> RemoveOption(List<SelectionListItem> list, Guid value)
        {
            SelectionListItem itemToRemove = list.Find(p => p.Key == value);
            list.Remove(itemToRemove);

            return list;
        }
    }
}
