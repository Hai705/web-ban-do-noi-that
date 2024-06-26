import { money_to_string } from './utils/money.js'
import { loadJson } from './utils/ajax.js'

function get_layout_classNames(layout) {
  layout = layout || 'grid'
  const layouts = {
    'list': {
      ctn: 'products-list-view',
      product_ctn: 'product-ctn-list',
      img_ctn:'product-img-ctn-list'
    },
    'grid': {
      ctn: 'products-grid-view',
      product_ctn: 'product-ctn',
      img_ctn:'product-img-ctn'
    }
  };
  return layouts[layout]
}

export class Product {
  constructor(product) {
    this.data = product
    // console.log(this.data)
  }

  inContainer(sel) {
    const product_sel = `${sel} .product-ctn[data-id='${this.data.id}']`
    return document.querySelector(product_sel) != null;
  }

  toHtml(className) {
    return `
<div data-id="${this.data.id}">
<a class="${className.product_ctn}" href="./singleproduct.html?id=${this.data.id}">
<div class="${className.img_ctn}">
<img src="${this.data.image}" alt="${this.data.name}">
</div>
<div class="product-info">
<p class="product-title">${this.data.name}</p>
<p class="product-price">${money_to_string(this.data.price, this.data.currency)}</p>
</div>
</a>
</div>
`;
  }

  get_property(attr) {
    return this.data[attr];
  }
}
// A products loader class that bound to a specific container/selector
export class ProductsLoader {
  constructor(selector) {
    this.data = loadJson("data/products.json")
    this.curIndex = 0;
    this.sel = selector || '.products-view';
    this.container = document.querySelector(this.sel)
  }

  reload(numListing, layout, product_list) {
    const classNames = get_layout_classNames(layout);
    this.curIndex = 0;
    this.container.setAttribute("class", this.sel.replace('.', '') + ' ' + classNames.ctn)
    return this.load(numListing, layout, product_list);
  }

  load(numListing, layout, offset, product_list) {
    // Only add style when loading product to a container
    this.curIndex = (isNaN(offset)) ? this.curIndex : offset;
    product_list = product_list || this.data;
    numListing = (numListing) ? numListing : product_list.length
    layout = layout || 'grid';

    if (!this.container) throw Error("Can not find matching selector");
    const product_css = "css/product.css"
    if (!document.querySelector(`link[href="${product_css}"]`)) {
      let link = document.createElement("link");
      link.href = product_css;
      link.rel = 'stylesheet';
      document.head.appendChild(link)
    }

    const classNames = get_layout_classNames(layout);
    let count = 0;
    if (!this.container.classList.contains(classNames.ctn)) {
      this.container.className = this.sel.replace('.', '') + ' ' + classNames.ctn;
    }

    let html = ""
    let valid_count = Math.min(this.entries() - this.curIndex, numListing) + this.curIndex

    let curProduct;
    for (; this.curIndex < valid_count; this.curIndex++) {
      curProduct = product_list[this.curIndex];
      if (curProduct) {
        html += new Product(curProduct).toHtml(classNames)
        count++;
      }
    }
    this.container.innerHTML = html;
    return count
  }

  getSingleproduct(id) {
    for (let p of this.data) {
      if (p.id == id) return p;
    }
    return null;
  }

  getAllProducts() { return this.data; }
  // Return the product count
  entries() { return this.data.length; }

  get_offset() { return this.curIndex; }
}
