
import React from 'react';
import { useParams } from 'react-router-dom';

const EditVaultItem: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>Edit Vault Item</h2>
      <p>Edit vault item with ID: {id}</p>
    </div>
  );
};

export default EditVaultItem;
