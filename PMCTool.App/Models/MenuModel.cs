using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class MenuModel : IEquatable<MenuModel>
    {
        public string Id;
        public string Description;
        public string ParentId;
        public string Icon;
        public string Action;
        public string Controller;
        public string MenuCode;
        public string ObjectCode;

        public override bool Equals(object obj)
        {
            if (obj == null)
                return false;
            MenuModel objAsMenu = obj as MenuModel;
            if (objAsMenu == null)
                return false;
            else
                return Equals(objAsMenu);
        }

        public override int GetHashCode()
        {
            return this.Id.GetHashCode();
        }

        public bool Equals(MenuModel other)
        {
            if (other == null)
                return false;

            if (this.Id == other.Id)
                return true;
            else
                return false;
        }
    }
}
