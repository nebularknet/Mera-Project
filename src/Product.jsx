import React from 'react';
import { ProductLinks } from './ProductLinks';

const Product = ({ product }) => {
  return (
    <div key={product.title} className='col-sm-6 col-md-4 col-lg-4'>
      <ProductLinks
        title={product.title}
        images={[product.smallImage]}
        facebook={product.links.facebook}
        twitter={product.links.twitter}
        wordpress={product.links.wordpress}
        instagram={product.links.instagram}
        pinterest={product.links.pinterest}
      />
    </div>
  )
}

export default Product;
