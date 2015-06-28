

# Introducción #

Las páginas web han evolucionado considerablemente en los últimos 20 años. Han pasado de ser páginas estáticas a aplicaciones web cuyo contenido se actualiza automáticamente (en *real-time*), sin interacción siquiera del usuario (por ejemplo, [Facebook](http://facebook.com) o [Twitter](http://twitter.com)). Esta tendencia ha dado origen a sitios catalogados como [Single Page Applications (SPA)](https://en.wikipedia.org/wiki/Single-page_application).

En un SPA todos los códigos de HTML, JavaScript, y CSS se cargan una vez y los recursos adicionales necesarios se cargan dinámicamente, lo cual normalmente sucede como respuesta de los acciones del usuario [^1]. Existen también las *real-time SPA*, en donde el contenido se "actualiza solo", sin interacción del usuario, como por ejemplo, cuando nos llega notificación en Facebook o un email en gmail.

Debido al auge en la creación de este tipo de sitios, se han creado numerosos frameworks MVC para browser (escritos en JS) orientados a su creación. Esto facilita mucho el desarrollo, pero tiene los siguientes problemas y limitaciones:

1. **Peso archivos JS**
En aplicaciones con mucho código, el código JS puede llegar a pesar más 10MB [^2], lo cual es inaceptable para un sitio web que es accedido desde celulares.

2. **SEO**
*SEO* es el proceso de mejorar la visibilidad de un sitio web en los resultados orgánicos de los diferentes buscadores [^3]. Esto es muy importante cuando se quiere que nuestra aplicación esté en los primeros lugares de una búsqueda. **¿Cómo afecta a esto sitios realizados con Ember.js o Angular.js?** Estas aplicaciones esperan que el cliente monte el HTML, pero en general, los [Crawlers](https://en.wikipedia.org/wiki/Web_crawler) no ejecutan JavaScript o tienen problemas con AJAX [^4], por lo que obtendrán una página en blanco al hacer un _request_ al servidor, y por ende, tendrán mal *SEO*. Si bien existen soluciones [^5], el hecho de que no sea comportamiento por defecto es un problema.

3. **Performance**
Como el servidor no envía la página HTML completa y se espera a que el _browser_ lo haga, los usuarios experimentarán una demora antes de ver el contenido de la página.

4. **Mantenibilidad**
Debido a que gran parte del código migra al cliente, hay mucha lógica que está compartida en cliente-servidor, tales como formato de textos, traducciones, *routing*, validaciones, lo cual es bastante tedioso de mantener, sobre todo en aplicaciones grandes (duplicación de código).

En el estado del arte, existen 3 soluciones [[5]](http://www.analog-ni.co/precomposing-a-spa-may-become-the-holy-grail-to-seo) para estos problemas. Una de ellas, es **Isomorphic JavaScript**.

# ¿Qué es _Isomorphic JavaScript_?

Cuando nos referimos a _Isomorphic JS_ queremos indicar que es posible ejecutar una misma pieza de código _JavaScript_ en cliente y en servidor. Esto es posible debido a _JavaScript_ puede ser ejecutado en ambos ambientes; por defecto en el _browser_, mientras que en el servidor utilizando [node.js](https://nodejs.org/) o [io.js](https://iojs.org)

Existen distintas técnicas y *frameworks* para lograr compartir el código, lo cual será descrito en la sección <a href="#cmoselogra" alt="¿Cómo se logra?">¿Cómo se logra?</a> y <a href="#solucionesexistentes" alt="Soluciones existentes">Soluciones existentes</a>

## ¿Qué soluciona? ##

Depende de cómo se implemente. Pero en general es posible solucionar los 4 problemas mencionados en la introducción:

### Peso de Archivos

Es posible solucionar el problema de performance relacionado con el peso de los archivos cargando dinámicamente archivos JavaScript a medida de que sea necesario. A continuación se verá un ejemplo.

Supongamos que estamos navegando por una aplicación para compartir imágenes, y que es en una SPA (que funciona como se muestra en **Imagen 1**). Digamos que las funcionalidades son las siguientes:

1. Feed (Ver imágenes de todos mis contactos).
2. Profile (Ver imágenes de un usuario en particular).
3. Ver una imagen en particular.

![SPA Típica](/content/images/2015/06/spa-1.png)
<div style="text-align: center; margin: 0 0 1.75em 0">
    <b>Imagen 1:</b> SPA Típica. Obtenida de <a href="https://www.youtube.com/watch?v=VkTCL6Nqm6Y">[2]</a>
</div>

El hecho de que funcione como indica la **Imagen 1**, implica que al entrar en cualquier sección se descarga toda la aplicación. 

¿Qué ocurre si esta pesa mucho? Pues, la primera vez que un usuario entra al sitio, tendrá que descargar todo el **código** para comenzar a utilizar la aplicación... ¿y si solo quiere ver el *Feed*?

Por esto, sería más conveniente cargar solo el código de la sección que estoy visitando. Es necesario separar la aplicación en componentes, como se muestra en la **Imagen 2**.

![SPA segmentada](/content/images/2015/06/webpack-1.png)
<div style="text-align: center; margin: 0 0 1.75em 0">
    <b>Imagen 2:</b> SPA modular. Obtenida de <a href="https://www.youtube.com/watch?v=VkTCL6Nqm6Y">[2]</a>
</div>

En este ejemplo, se separa la aplicación en 3 módulos:

1. Módulo de librerías compartidas (React y PhotoModal, color azul).
2. Módulo que tiene el código del Perfil (ProfileEntrypoint, color naranjo).
3. Módulo que tiene el código del Feed (FeedEntrypoint, color amarillo).

Por lo tanto, cuando entro al sitio por primera vez se descarga *shared.js*. Luego, al ingresar a un perfil se descargará *profileentrypoint.js*. Finalmente, al entrar al Feed, *feedentrypoint.js*.

En consecuencia, ya no se estará descargando un archivo con toda la aplicación, si no que por partes, lo que reducirá el código que los usuarios deben descargar para comenzar a usar la aplicación.

El ejemplo completo junto a una explicación más detallada se encuentra en <a href="https://www.youtube.com/watch?v=VkTCL6Nqm6Y">[2]</a>.

### SEO

Con Isomorphic JavaScript, es posible tener un template engine en los dos ambientes. Es importante que la librería a utilizar tenga *server side rendering*. Por ejemplo, ni AngularJS ni EmberJS cumplen con esto (al menos por defecto). La librería más utilizada para éste propósito es [React](http://facebook.github.io/react/) (mantenida por Facebook).

Utilizando React es posible lograr que el servidor entregue el HTML preprocesado, y que luego el cliente lea este HTML y pueda montar todo lo necesario sin tener que sobrescribir.

Hay que destacar que React por sí mismo no hace mucho, es una librería que se centra en la creación de interfaces. Puede verse como la "V" de un framework MVC.

### Performance

Siguiendo la línea de la sección anterior, con **React** es posible que el cliente recupere el estado con el cual el servidor envía el HTML procesado, sin necesidad de sobreescribirlo.

Esto, sumado a que se ha solucionado el problema del peso de los archivos, contribuye a que la página cargue más rápido. Además, no se verán comportamiento no deseados, como por ejemplo, que se vuelva a generar el DOM mientras el usuario esté interactuando con la aplicación.

### Mantenibilidad 

El hecho de tener una pieza de código compartida en el cliente y en el servidor hace que nuestro código sea más mantenible, debido a que las modificaciones en un archivo afecta ambos ambientes (evitando la duplicación de código).

Por ejemplo, una función para validar el RUT ingresado podría ser compartida. En el cliente se usaría para validar un formulario antes de enviarlo, y en el servidor para validar que sea correcto antes de guardarlo en la base de datos. El test unitario de la función también sería compartido.  En caso de solucionar un posible bug, se soluciona para ambos ambientes.

## ¿Cómo se logra?

Conceptualmente existen 2 tipos código isomórfico [^n]: _environment agnostic_ y _shimmed per environment_.

- *Environment agnostic modules:* no depende de propiedades específicas del browser (window) ni en propiedades específicas del servidor (process.env). 
- *Modules shimmed per environment:* proveer una API común para cliente/servidor, pero diferente implementación para cada uno de los ambientes.

Los primeros módulos funcionan bien siempre, ya que usan funcionalidad pura de JavaScript. [Underscore.js](http://underscorejs.com), [Moment](http://http://momentjs.com/) son un ejemplo de este tipo.

Los segundos módulos son abstracciones que se hacen para poder proveer una misma funcionalidad en ambos ambientes, usando la misma API. Por ejemplo, para hacer requests, en el browser tenemos a [XMLHttpRequest](https://developer.mozilla.org/en/docs/AJAX) y en node.js a [http](https://nodejs.org/docs/latest/api/http.html). Ambos proveen la funcionalidad de _networking_ pero con una interfaz totalmente diferente. Es aquí donde librerías como [superagent](https://github.com/visionmedia/superagent) entran al rescate, proporcionando una misma API para realizar requests en cliente y servidor. 

Las librerías _shimmed per environment_ en general tienen dos implementaciones, una para cliente y otra para servidor. Así:

- Cuando la librería está siendo utilizada en el cliente, exporta la implementación para browser.
- Cuando la librería está siendo utilizada en el servidor, exporta la implementación del servidor.

En código, esto se vería como sigue:

```
if(isServer){
    module.exports = require('./server');
} else {
    module.exports = require('./client');
}
```

La variable `isServer` está siendo usada para saber si el  se está ejecutando en el servidor. Una forma de darle valor a la variable es la siguiente:

`var isServer = typeof window === 'undefined';`

Esto usado en algunos frameworks populares como **Meteor** o **Rendr** (de los cuales se hablará más adelante).

Notar que aquí hay otro problema; utilización de `module.exports` y de `require`, ambas disponibles solo en node.js.

Nuevamente una librería soluciona esta barrera: [Browerify](http://browserify.org/). Esta herramienta permite utilizar `require` en el cliente, incluso de módulos específicos de node.js, como [EventEmitter](https://nodejs.org/api/events.html).

Hasta ahora se ha planteado una noción de cómo ejecutar sin problemas un script en ambos ambientes. Pero, **¿cómo se logra que un script esté disponible en cliente y servidor**.

Una solución sencilla, tediosa y poco escalable: copiar los archivos JS a compartir en carpeta "public". Por suerte, existe [Grunt](http://gruntjs.com/).

**Grunt** es una librería que para automatizar tareas de JavaScript. Permite, entre otras cosas, copiar archivos de una carpeta a otra, concatenar múltiples archivos en uno solo, compilar y minificar.

Usando Grunt y Browserify se puede:

- Tomar archivos a compartir.
- Armar dependencias (*requires*) de estos archivos.
- Concatenar todos en 1 solo archivo.
- Minificar.
- Guardar archivo resultante en carpeta **public**.

En en el siguiente repositorio hay un ejemplo sencillo de aplicación isomorfica utilizando estas herramientas:

- https://github.com/muZk/isomorphic-js-proof-of-concept/tree/master/minimal-isomorphic

El proyecto utiliza [grunt-browserify](https://github.com/jmreidy/grunt-browserify), un módulo que facilita el trabajo en conjunto de **Grunt** y **Browserify**.

Para probarlo basta con ejecutar los siguientes comandos:

```
git clone https://github.com/muZk/isomorphic-js-proof-of-concept.git
cd isomorphic-js-proof-of-concept
cd minimal-isomorphic
npm install
grunt server
```

El proyecto es un "hello world", una posible aplicación base (*boilerplate*) para aplicaciones isomórficas (aunque lo dejaría más bien para jugar con los conceptos).

La estructura de archivos de la aplicación es la siguiente:

```
.
├── app
│   ├── client
│   │   └── client.js
│   ├── layouts
│   │   ├── home
│   │   ├── layout.jade
│   ├── server
│   │   └── server.js
│   └── shared
│       └── shared.js
├── assets
│   └── stylesheets
├── Gruntfile.js
├── node_modules
├── package.json
├── public
│   ├── application.js
│   └── styles.css
└── server.js

```

Gruntfile.js contiene la configuración de browserify. Además concatena el contenido de las carpetas `app/shared` y `app/client` en el archivo `public/application.js`. Los scripts que están dentro de `app/shared/` serán ejecutados en cliente y servidor. El archivo `public/application.js` solo incluye `app/client` y a `app/shared`. 

El contenido de `app/shared/shared.js` es este:

```
console.log('shared.js loaded');

var isServer = typeof window === 'undefined';
var isClient = typeof window !== 'undefined';

if(isServer)
  console.log('shared.js running on server');

if(isClient)
  console.log('shared.js running on client');
```

Cuando es cargado en el cliente, `isClient` es `true`, y se imprimirá en consola `shared.js running on client`. Esto ocurre de forma análoga cuando se ejecuta el script en el servidor.

Notar gracias a Browserify es posible hacer esto:

```
// app/client/example.js

var _ = require('underscore');

var numbers = [10, 5, 100, 2, 1000];

console.log('min number is', _.min(numbers));
```

o incluso esto:

```
// app/client/example.js
var myModel = require('./shared/model.js');
```

Para finalizar esta sección, hay que destacar que _shimmed per environment_ es un concepto que permite abstracciones más poderosas que en el ejemplo planteado.

Por ejemplo, es posible crear un objeto *User* (_shimmed per environment_), que cumpla con lo siguiente:

- Proveer método find(query, callback)
- En cliente, obtiene lista de usuarios de servidor (AJAX).
- En el servidor, obtiene lista de usuarios de *mongodb*.

La implementación podría ser algo como:

```
// User.js

var User = {
    find: function(query, callback){
        if(isServer){
            return require('mongoose')
                     .model('User')
                     .find(query, callback)    
        } else {
            return require('superagent')
                     .get('/api/users')
                     .query(query)
                     .end(callback);
        }
    }
};

module.exports = User;
```



## Consideraciones especiales

Cuando se escriben aplicaciones isomórficas hay que tener especial cuidado con el código que se está compartiendo. Siempre hay que dejar fuera archivos que tengan configuración, *apikeys*, y lógica de negocio que pueda comprometer la seguridad de la aplicación. 

También hay que ser precavido con los elementos que usamos, por ejemplo, en el browser no es posible usar cosas funciones del _file system_ como lo hacemos en node.js, y en el servidor no existen los objetos `window`/`document`.

# Soluciones existentes

Existen varios frameworks para realizar este tipo de aplicaciones, disponibles en http://isomorphic.net/

A continuación se describirán alguno de estos.

## Meteor

Sitio web: https://www.meteor.com/

Meteor es un framework open source construido sobre node.js que permite la creación de real-time applications utilizando JavaScript [^7]. Los principios de esta herramienta están descritos en la documentación [^8] y son los siguientes:

- **Data on the wire:** Meteor no envía HTML a través de la red. El servidor envía datos, y el cliente los interpreta y presenta.
- **One Language:** Meteor permite escribir JavaScript en el cliente y en el servidor.
- **Database Everywhere:** es posible usar los mismos métodos para acceder a la base de datos en el cliente y en el servidor. 
- **Full Stack Reactivity:** Meteor es real-time por defecto. Todas las capas, desde la base de datos hasta los templates, se actualizan automáticamente cuando es necesario.
- **Embrace the Ecosystem:** Meteor es open source y se integra con las herramientas y frameworks open source existentes.
- **Simplicity Equals Productivity:** la mejor manera de hacer que algo parezca sencillo es que realmente lo sea. Las funcionalidades principales de Meteor tienen APIs "bonitas" y limpias.

## Rendr

Sitio web: http://rendrjs.github.io/

Es una librería que permite ejecutar aplicaciones **Backbone.js** tanto en cliente como en servidor. Permite que el servidor web responda con páginas HTML completas.

Es una buena opción si se tiene conocimientos de **Backbone.js** y de **Express.js**. Las aplicaciones creadas con este framework son isomórficas, se comparte models, collections, views y routing.

## Flux

Sitio web: https://facebook.github.io/flux/

Flux es una arquitectura. Lo que lo hace interesante es que su flujo es unidireccional, a diferencia de MVC. En la **Imagen 3** hay un diagrama que muestra los componentes arquitectura y cómo se comunican.

![Arquitectura Flux](/content/images/2015/06/flux-1.png)
<div style="text-align: center; margin: 0 0 1.75em 0">
    <b>Imagen 3:</b> Arquitectura Flux. Obtenida de <a href="https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture">[9]</a>
</div>

La mejor forma de explicar la arquitectura es describiendo sus componentes:

- Actions: métodos que ayudan a pasar datos al Dispatcher.
- Dispatcher: reciben acciones y las transmiten a los callbacks registrados.
- Stores: contenedores del estado y de la lógica de la aplicación, tienen callbacks registradas en el Dispatcher.
- Controller View (View): componentes React que obtienen el estado de los Store. 

¿Qué tiene que ver con **isomorphic js**?

**Flux** se usa en conjunto con **React**, y **React** es una librería isomórfica que permite crear interfaces de usuario. Si bien pareciera ser una arquitectura que aplica solo al cliente, recordar que las **Views** obtienen el estado de los **Stores**, por lo que se hace necesario que el servidor alimente dichos componentes para que envíen el HTML completo.

Entonces, el flujo completo podría verse así:

1. Usuario accede a página web de una aplicación.
2. Servidor entrega datos a Stores, y luego envía HTML al cliente usando React (entregando de alguna forma el estado).
3. Browser obtiene el estado, con lo que alimenta Stores, y luego monta las vistas React (que debería ser igual a lo que envía el servidor, por lo que no se sobrescribe).
4. Usuario interactúa con Views.
5. Views llaman a Actions.
6. Actions transmiten una acción al Dispatcher.
7. Dispatcher transmite la acción a todos los callbacks registrados.
8. Si un Store registró alguna función en el dispatcher, recibirá la acción.
9. Store actualiza su estado y emite evento.
10. View, que escucha a eventos de los Stores, actualiza su estado.

Hay que destacar que el paso de 2 a 3 no es trivial. Que el cliente obtenga datos de una API para el estado no es opción, ya que React espera tener el estado inicial apenas carga la página. Es posible hacer que el servidor ponga en una sección del HTML los datos que el cliente necesita. Esta opción es la que se hace en la práctica y suena no muy difícil de hacer, pero hay que tener en cuenta que a medida que la aplicación crece podría ser más complicado de mantener.

La **Imagen 4** complementa el flujo descrito anteriormente.

![Arquitectura Flux, flujo detallado](/content/images/2015/06/flux_extended-1.png)
<div style="text-align: center; margin: 0 0 1.75em 0">
    <b>Imagen 4:</b> Flujo detallado de arquitectura Flux. Obtenida de <a href="https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture">[9]</a>
</div>

Construir una aplicación con Flux es más lento (al inicio). A medida que la complejidad de la aplicación aumenta, debería ser más fácil agregar funcionalidades nuevas y mantener el código existente [^10].

Existen muchas implementaciones de esta arquitectura. Desde las más minimalistas ([Facebook flux](https://github.com/facebook/flux)) a más complejas ([Yahoo Fluxible](https://github.com/yahoo/fluxible)). De hecho, existen proyectos donde se intenta comparar varias de estas [^11].

Además es importante destacar que la mayoría de repositorios encontrados en [github](https://github.com/) al buscar _isomorphic_ están relacionados con flux o react [^12].

# Material complementario

A continuación se presenta material complementario. Alguno de los links se encuentran en las referencias a lo largo del artículo.

- [Scaling Isomorphic Javascript Code](http://blog.nodejitsu.com/scaling-isomorphic-javascript-code)
- [IsomorphicJS news en isomorphic.net](http://isomorphic.net/)
    - [Isomorphic JavaScript: The Future of Web Apps](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/)
    - [The future of web apps is — ready? — isomorphic JavaScript](http://venturebeat.com/2013/11/08/the-future-of-web-apps-is-ready-isomorphic-javascript/)
    - [Master Class: Isomorphic JavaScript]()
    - [Spike Brehm and Pete Hunt interviewed at Fluent 2014](https://www.youtube.com/watch?v=KXEakCuiP2A)
- [Spike Brehm: Building Isomorphic Apps](https://www.youtube.com/watch?v=tcbcERdxjIc)

Con respecto a las herramientas, hay que tener en consideración:

- [Webpack](http://webpack.github.io/)
- [React](http://facebook.github.io/react/)
- [Flux](https://facebook.github.io/flux/)
- [Fluxible](http://fluxible.io/api/bringing-flux-to-the-server.html)
- [Alt flux](http://alt.js.org/)
- [Meteor](https://www.meteor.com/)

Material sobre flux:

- [Getting know to flux, the ReactJS Architecture](https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture) (explicación sobre la arquitectura Flux)
- [Navigating the react ecosystem](http://www.toptal.com/react/navigating-the-react-ecosystem) (estado del arte de las herramientas relacionadas con Flux).

# Conclusión

*Isomorphic Javascript* llegó para quedarse. Cada vez son más los frameworks, librerías y herramientas que están destinadas a ser usadas en cliente y servidor. Sin embargo, el futuro es incierto. Hay esfuerzos orientados en la creación de un *full stack frameworks* (**Meteor**), y otros enfocados en creación de librerías que solucionen un aspecto en particular (**React**, y arquitectura **Flux**). 

Frameworks MVC en el cliente no se quedan atrás. El popular framework **EmberJS** ha publicado en su [su blog](http://emberjs.com/blog/2014/12/22/inside-fastboot-the-road-to-server-side-rendering.html) que permitirá *server-side rendering*. Por su parte, [Angular 2.0](http://angular.io/) (la nueva versión en que se está trabajando) no admitirá isomorfismo por defecto. No obstante, se está formando una comunidad para hacerlo posible [^14].

*Isomorphic JavaScript* no se detiene aquí. El famoso **ORM** [Mongoose.js](http://mongoosejs.com/) es **parcialmente isomorfico** [^15], aunque no se encuentra en su **roadmap** el agregar más funcionalidades [^16]. También hay _game engines_ que están optando por un enfoque isomórfico, como por ejemplo [LycheeJS](https://github.com/LazerUnicorns/lycheeJS).

A pesar de lo genial y vanguardista que puede ser crear una aplicación desde este enfoque, siempre hay que tener en cuenta qué tipo de aplicación estamos realizando, qué casos de uso esta contempla, y **sobre todo** *a las personas que están trabajando en el mismo*[^17].

# Referencias

[^1]: https://es.wikipedia.org/wiki/Single-page_application.
[^2]: https://www.youtube.com/watch?v=VkTCL6Nqm6Y
[^3]: https://es.wikipedia.org/wiki/Posicionamiento\_en_buscadores
[^4]: Si bien GoogleBot funciona bien con sitios con AJAX, hay otros crawlers que sí tienen problemas: http://www.analog-ni.co/precomposing-a-spa-may-become-the-holy-grail-to-seo
[^5]: https://prerender.io/
[^6]: http://josdejong.com/blog/2015/03/28/a-broader-view-on-isomorphic-javascript/
[^7]: http://www.meteorpedia.com/read/Why_Meteor
[^8]: https://www.meteor.com/projects
[^9]: https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture
[^10]: https://facebook.github.io/flux/docs/chat.html#content
[^11]: https://github.com/voronianski/flux-comparison
[^12]: https://github.com/search?o=desc&q=isomorphic&s=&type=Repositories&utf8=%E2%9C%93
[^13]: http://emberjs.com/blog/2014/12/22/inside-fastboot-the-road-to-server-side-rendering.html
[^14]: https://github.com/mbujs/isomorphic-angular
[^15]: "*Mongoose is now partially isomorphic.*"  https://github.com/Automattic/mongoose/wiki/4.0-Release-Notes
[^16]: https://github.com/Automattic/mongoose/issues/3061
[^17]: https://www.linkedin.com/pulse/did-you-pick-wrong-web-framework-marvin-li

