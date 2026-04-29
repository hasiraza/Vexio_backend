// Generic controller factory for CRUD operations
const createController = (Model, populateFields = []) => {
  return {
    getAll: async (req, res) => {
      try {
        const { page = 1, limit = 50, search, status, ...filters } = req.query;
        const query = {};
        if (status) query.status = status;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
          ];
        }
        Object.keys(filters).forEach(key => {
          if (filters[key]) query[key] = filters[key];
        });

        let q = Model.find(query).sort({ createdAt: -1 });
        populateFields.forEach(f => q = q.populate(f));

        const total = await Model.countDocuments(query);
        const data = await q.limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
        res.json({ data, total, page: parseInt(page), pages: Math.ceil(total / limit) });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getOne: async (req, res) => {
      try {
        let q = Model.findById(req.params.id);
        populateFields.forEach(f => q = q.populate(f));
        const item = await q;
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    create: async (req, res) => {
      try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json(item);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    update: async (req, res) => {
      try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    remove: async (req, res) => {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  };
};

module.exports = createController;
