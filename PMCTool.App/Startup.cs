using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using DinkToPdf;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;

namespace PMCTool.App
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
              .SetBasePath(AppContext.BaseDirectory)
              .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
              .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
              .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLocalization(options => { options.ResourcesPath = "Resources"; });

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0)
                .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix, opts => { opts.ResourcesPath = "Resources"; })
                .AddDataAnnotationsLocalization(
                    options => options.DataAnnotationLocalizerProvider = (type, factory) =>
                    {
                        return factory.Create(typeof(SharedResource));
                    });

            services.Configure<AppSettingsModel>(Configuration.GetSection("AppSettings"));
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<SharedViewLocalizer>();
            services.AddSingleton(typeof(IConverter), new SynchronizedConverter(new PdfTools()));
            
            // Explicitly state which cultures your application supports.
            IList<CultureInfo> supportedCultures = new List<CultureInfo>
            {
                new CultureInfo("en-US"),
                new CultureInfo("es-MX"),
            };

            services.Configure<RequestLocalizationOptions>(options =>
            {
                // State what the default culture. This will be used if no specific culture can be determined for a given request.
                options.DefaultRequestCulture = new RequestCulture("es-MX");
                // These are the cultures the app supports for formatting numbers, dates, etc.
                options.SupportedCultures = supportedCultures;
                // These are the cultures the app supports for UI strings, i.e. we have localized resources for.
                options.SupportedUICultures = supportedCultures;
                // Request culture providers
                options.RequestCultureProviders = new List<IRequestCultureProvider> {
                    new CookieRequestCultureProvider(),
                    //new QueryStringRequestCultureProvider(),
                    //new AcceptLanguageHeaderRequestCultureProvider()
                };
            });

            services.AddCookieManager(options =>
            {
                //allow cookie data to encrypt by default it allow encryption
                options.AllowEncryption = true;
                //Throw if not all chunks of a cookie are available on a request for re-assembly.
                options.ThrowForPartialCookies = true;
                // set null if not allow to devide in chunks
                options.ChunkSize = null;
                //Default Cookie expire time if expire time set to null of cookie
                //default time is 1 day to expire cookie
                options.DefaultExpireTimeInDays = 7;
            });

            services.AddMvc().AddSessionStateTempDataProvider();
            services.AddSession();

            // Adds a default in-memory implementation of IDistributedCache.
            services.AddDistributedMemoryCache();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error/500");
                app.UseStatusCodePagesWithReExecute("/Error/{0}");
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            var localizationOptions = app.ApplicationServices.GetService<IOptions<RequestLocalizationOptions>>();
            app.UseRequestLocalization(localizationOptions.Value);

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}