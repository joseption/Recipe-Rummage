import React from 'react';

import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import ItemUI from '../components/ItemUI';

const ItemPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoggedInName />
            <ItemUI />
        </div>
    );
}

export default ItemPage;
