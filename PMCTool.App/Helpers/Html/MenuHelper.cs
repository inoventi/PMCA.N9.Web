using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Helpers.Html
{
    public static class MenuHelper
    {

        public static async Task<HtmlString> RenderMenu(HttpContext context)
        {
            HtmlString result = new HtmlString("");
            result = await UserMenuCreate(context);
            return new HtmlString(result.ToString());
        }

        private static async Task<HtmlString> UserMenuCreate(HttpContext context)
        {
            TagBuilder ul = new TagBuilder("ul");
            ul.AddCssClass("nav");

            //List<MenuModel> userMenus = await GetMenus(context);
            List<MenuModel> userMenus = new List<MenuModel>
                (
                    new MenuModel[]
                    {
                        new MenuModel()
                        {
                            Id = "1",
                            Description = "Inicio",
                            ParentId = "",
                            Icon = "nc-icon nc-bank",
                            Action = "Index",
                            Controller = "Home",
                            MenuCode = "001",
                            ObjectCode = "001"
                        },
                        new MenuModel()
                        {
                            Id = "2",
                            Description = "Ubicación de sucursales",
                            ParentId = "",
                            Icon = "nc-icon nc-square-pin",
                            Action = null,
                            Controller = null,
                            MenuCode = "002",
                            ObjectCode = "002"
                        },
                        new MenuModel()
                        {
                            Id = "3",
                            Description = "Avances de sucursales",
                            ParentId = "",
                            Icon = "nc-icon nc-chart-bar-32",
                            Action = "Index",
                            Controller = "BranchAdvances",
                            MenuCode = "003",
                            ObjectCode = "003"
                        },
                        new MenuModel()
                        {
                            Id = "4",
                            Description = "Ficha de proyectos",
                            ParentId = "",
                            Icon = "nc-icon nc-notes",
                            Action = null,
                            Controller = null,
                            MenuCode = "004",
                            ObjectCode = "004"
                        },
                        new MenuModel()
                        {
                            Id = "100",
                            Description = "Salir",
                            ParentId = "",
                            Icon = "fas fa-power-off f18",
                            Action = "Logout",
                            Controller = "Auth",
                            MenuCode = "100",
                            ObjectCode = "100"
                        },
                    }
                );

            TagBuilder mainMenu = CreateMenus(ul, userMenus, null);

            string r = RenderContent(mainMenu);
            return new HtmlString(r);
        }

        private static async Task<List<MenuModel>> GetMenus(HttpContext context)
        {
            List<MenuModel> result = new List<MenuModel>();
            RestClient restClient = new RestClient();
            string baseUrl = AppSettings.Current.BaseUrl;
            string pmMenuCodes = AppSettings.Current.PmMenuCodes;
            string[] pmCodes = pmMenuCodes.Split(",");

            Dictionary<string, string> header = new Dictionary<string, string>();

            try
            {
                string token = context.Request.Cookies["pmctool-token-app"];
                string lang = context.Request.Cookies["pmctool-lang-app"];
                int system = (int)EnumFactory.System.PMCTool_App;

                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);
                string userId = jwt.Claims.FirstOrDefault(x => x.Type == "jti").Value;
                int userType = int.Parse(jwt.Claims.FirstOrDefault(x => x.Type == "TP").Value);
                string env = jwt.Claims.FirstOrDefault(x => x.Type == "Env").Value;

                header.Add("Authorization", token);

                var userEnvironment = await restClient.Get<UserEnvironment>(baseUrl, $"/api/v1/userenvironments/user/{userId}/environment/{env}", header);
                var menus = await restClient.Get<IEnumerable<ObjectMenuByUser>>(baseUrl, $"/api/v1/useraccess/{lang}/{system}", header);

                foreach (var menu in menus)
                {
                    MenuModel item = new MenuModel();
                    item.Id = menu.ObjectID.ToString();
                    item.Description = menu.MenuName;
                    item.ParentId = menu.MenuParentID.ToString();
                    item.Icon = menu.Icon;
                    item.Action = menu.ObjectAction;
                    item.Controller = menu.ObjectController;
                    item.MenuCode = menu.MenuCode;
                    item.ObjectCode = menu.ObjectCode;
                    
                    if (pmCodes.Contains(menu.MenuCode) && userType == (int)EnumFactory.UserType.App) {
                        if (userEnvironment.LicenseType == (int)EnumFactory.UserLicenseType.ProjectManager)
                            result.Add(item);
                    }
                    else {
                        result.Add(item);
                    }
                }

                for (int i = 0; i < result.Count; i++)
                {
                    if (!string.IsNullOrEmpty(result[i].ParentId))
                    {
                        MenuModel parentMenu = new MenuModel();
                        parentMenu.Id = result[i].ParentId;

                        if (!result.Contains(parentMenu))
                        {
                            var parent = await restClient.Get<ObjectMenu>(baseUrl, $"/api/v1/menus/{parentMenu.Id}/languages/{lang}", header);
                            parentMenu.Description = parent.MenuName;
                            parentMenu.ParentId = parent.MenuParentID.ToString();
                            parentMenu.Icon = parent.Icon;
                            parentMenu.Action = parent.ObjectAction;
                            parentMenu.Controller = parent.ObjectController;
                            parentMenu.MenuCode = parent.MenuCode;
                            parentMenu.ObjectCode = parent.ObjectCode;
                            result.Add(parentMenu);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }

            return result;
        }

        private static TagBuilder CreateMenus(TagBuilder root, List<MenuModel> UserMenus, MenuModel RootMenu)
        {

            List<MenuModel> UserRootMenus = new List<MenuModel>();

            if (RootMenu == null)
            {
                UserRootMenus = UserMenus.Where(m => m.ParentId == "").OrderBy(o => o.MenuCode).ToList();
            }
            else
            {
                UserRootMenus = UserMenus.Where(m => m.ParentId == RootMenu.Id).OrderBy(o => o.MenuCode).ToList();
            }

            foreach (MenuModel ActualMenu in UserRootMenus)
            {
                if (UserMenus.Count(m => m.ParentId == ActualMenu.Id) == 0)
                {
                    CreateMenu(root, ActualMenu);
                }
                else
                {
                    TagBuilder li = new TagBuilder("li");
                    li.AddCssClass("nav-item");
                    li.Attributes.Add("id", ActualMenu.ObjectCode);

                    TagBuilder a = new TagBuilder("a");
                    a.AddCssClass("nav-link");
                    a.Attributes.Add("data-toggle", "collapse");
                    a.Attributes.Add("data-target", "#Mn" + ActualMenu.MenuCode);
                    a.Attributes.Add("href", "#Mn" + ActualMenu.MenuCode);
                    a.InnerHtml.AppendHtml("<i class='" + ActualMenu.Icon + "'></i><p>" + ActualMenu.Description + "<b class='caret'></b></p>");

                    TagBuilder div = new TagBuilder("div");
                    div.AddCssClass("collapse");
                    div.Attributes.Add("id", "Mn" + ActualMenu.MenuCode);

                    TagBuilder ul = new TagBuilder("ul");
                    ul = CreateMenus(ul, UserMenus, ActualMenu);
                    ul.AddCssClass("nav");

                    string ult = RenderContent(ul);
                    div.InnerHtml.AppendHtml(ult);

                    string at = RenderContent(a);
                    li.InnerHtml.AppendHtml(at);

                    string divt = RenderContent(div);
                    li.InnerHtml.AppendHtml(divt);

                    string lit = RenderContent(li);

                    root.InnerHtml.AppendHtml(lit);
                }
            }

            return root;
        }

        private static TagBuilder CreateMenu(TagBuilder parent, MenuModel item)
        {
            string href = "";
            TagBuilder li = new TagBuilder("li");
            li.AddCssClass("nav-item");
            li.Attributes.Add("id", item.ObjectCode);

            TagBuilder a = new TagBuilder("a");
            a.AddCssClass("nav-link");
            a.InnerHtml.AppendHtml("<i class='" + item.Icon + "'></i> <p>" + item.Description + "</p>");

            if (!string.IsNullOrEmpty(item.Controller) && !string.IsNullOrEmpty(item.Action))
            {
                a.Attributes.Add("href", @"/" + item.Controller + @"/" + item.Action);
            }

            string at = RenderContent(a);
            li.InnerHtml.AppendHtml(at);

            string lit = RenderContent(li);
            parent.InnerHtml.AppendHtml(lit);

            return parent;
        }

        private static string RenderContent(TagBuilder tag)
        {

            string result = "";

            using (var writer = new StringWriter())
            {
                tag.WriteTo(writer, System.Text.Encodings.Web.HtmlEncoder.Default);
                result = writer.ToString();
            }

            return result;
        }
    }
}
