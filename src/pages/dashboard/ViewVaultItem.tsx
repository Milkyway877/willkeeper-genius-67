
import React from 'react';
import { useParams } from 'react-router-dom';

const ViewVaultItem: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>View Vault Item</h2>
      <p>Viewing vault item with ID: {id}</p>
    </div>
  );
};

export default ViewVaultItem;
