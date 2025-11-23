import { SystemComponent } from '../types';
import { Plus, X, Database, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface ComponentLibrarySectionProps {
  components: SystemComponent[];
  onUpdate: (components: SystemComponent[]) => void;
}

// Pre-defined system components are now initialized in App.tsx

export default function ComponentLibrarySection({ components, onUpdate }: ComponentLibrarySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addComponent = (component: Omit<SystemComponent, 'id'>) => {
    const newComponent: SystemComponent = {
      ...component,
      id: Date.now().toString(),
    };
    onUpdate([...components, newComponent]);
    setShowAddForm(false);
  };

  const updateComponent = (id: string, updates: Partial<SystemComponent>) => {
    onUpdate(components.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingId(null);
  };

  const removeComponent = (id: string) => {
    onUpdate(components.filter(c => c.id !== id));
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Database className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Component Library</h2>
            <p className="text-sm text-slate-600 mt-1">
              Define components that map to employee database fields (e.g., DA, HRS, BASIC)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Component
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddComponentForm
          onAdd={addComponent}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {isExpanded && (
        <div className="mt-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These components map to fields in your employee database. 
              When configuring payroll, select these components instead of entering manual amounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {components.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                isEditing={editingId === component.id}
                onEdit={() => setEditingId(component.id)}
                onUpdate={(updates) => updateComponent(component.id, updates)}
                onRemove={() => removeComponent(component.id)}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="mt-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">
              <strong>{components.length}</strong> system components defined
            </span>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ComponentCard({ 
  component, 
  isEditing, 
  onEdit, 
  onUpdate, 
  onRemove, 
  onCancelEdit 
}: {
  component: SystemComponent;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<SystemComponent>) => void;
  onRemove: () => void;
  onCancelEdit: () => void;
}) {
  if (isEditing) {
    return (
      <div className="p-3 border-2 border-primary-300 rounded-lg bg-white">
        <input
          type="text"
          value={component.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Component Name"
          className="w-full px-2 py-1 mb-2 border border-slate-300 rounded text-sm"
        />
        <input
          type="text"
          value={component.code}
          onChange={(e) => onUpdate({ code: e.target.value })}
          placeholder="Code"
          className="w-full px-2 py-1 mb-2 border border-slate-300 rounded text-sm font-mono"
        />
        <input
          type="text"
          value={component.databaseField}
          onChange={(e) => onUpdate({ databaseField: e.target.value })}
          placeholder="Database Field"
          className="w-full px-2 py-1 mb-2 border border-slate-300 rounded text-sm font-mono text-xs"
        />
        <select
          value={component.category}
          onChange={(e) => onUpdate({ category: e.target.value as any })}
          className="w-full px-2 py-1 mb-2 border border-slate-300 rounded text-sm"
        >
          <option value="earning">Earning</option>
          <option value="deduction">Deduction</option>
          <option value="credit">Credit</option>
          <option value="tax">Tax</option>
          <option value="other">Other</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({})}
            className="flex-1 px-2 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-semibold text-slate-900 text-sm">{component.name}</div>
          <div className="text-xs font-mono text-slate-600 mt-1">{component.code}</div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Edit"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-50 rounded text-red-600"
            title="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
        DB: {component.databaseField}
      </div>
      <div className="mt-2">
        <span className={`text-xs px-2 py-0.5 rounded ${
          component.category === 'earning' ? 'bg-green-100 text-green-700' :
          component.category === 'deduction' ? 'bg-red-100 text-red-700' :
          component.category === 'credit' ? 'bg-blue-100 text-blue-700' :
          component.category === 'tax' ? 'bg-purple-100 text-purple-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {component.category}
        </span>
      </div>
    </div>
  );
}

function AddComponentForm({ onAdd, onCancel }: { 
  onAdd: (component: Omit<SystemComponent, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [databaseField, setDatabaseField] = useState('');
  const [category, setCategory] = useState<'earning' | 'deduction' | 'credit' | 'tax' | 'other'>('earning');

  const handleSubmit = () => {
    if (name && code && databaseField) {
      onAdd({ name, code, databaseField, category });
      setName('');
      setCode('');
      setDatabaseField('');
      setCategory('earning');
    }
  };

  return (
    <div className="mb-4 p-4 border-2 border-primary-300 rounded-lg bg-primary-50">
      <h3 className="font-semibold text-slate-900 mb-3">Add New System Component</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Component Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dearness Allowance"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., DA"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="earning">Earning</option>
              <option value="deduction">Deduction</option>
              <option value="credit">Credit</option>
              <option value="tax">Tax</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Database Field Name</label>
          <input
            type="text"
            value={databaseField}
            onChange={(e) => setDatabaseField(e.target.value)}
            placeholder="e.g., da_amount, basic_salary"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
          />
          <p className="text-xs text-slate-500 mt-1">
            This should match the field name in your employee database
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Add Component
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

